import { supabase } from "@/app/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product, ProductsResponse } from "@/app/types";
import type { CategoryRow, ProductRow, ReviewRow } from "@/app/types/database";

type ProductRowWithRelations = ProductRow & {
  category?: CategoryRow | null;
  reviews?: ReviewRow[] | null;
};

// Supabase stores snake_case columns and a flat meta; the app uses the
// camelCase Product type. Convert here so components don't need to change.
function toProduct(row: ProductRowWithRelations): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    categoryId: row.category_id,
    category: row.category
      ? { ...row.category, image: row.category.image ?? "" }
      : undefined,
    price: row.price,
    discountPercentage: row.discount_percentage ?? undefined,
    rating: row.rating ?? undefined,
    stock: row.stock ?? undefined,
    tags: row.tags ?? undefined,
    brand: row.brand ?? undefined,
    sku: row.sku ?? undefined,
    weight: row.weight ?? undefined,
    dimensions: row.dimensions ?? undefined,
    warrantyInformation: row.warranty_information ?? undefined,
    shippingInformation: row.shipping_information ?? undefined,
    availabilityStatus: row.availability_status ?? undefined,
    reviews: (row.reviews ?? []).map((review) => ({
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      reviewerName: review.reviewer_name,
      reviewerEmail: review.reviewer_email,
    })),
    returnPolicy: row.return_policy ?? undefined,
    minimumOrderQuantity: row.minimum_order_quantity ?? undefined,
    meta: {
      createdAt: row.meta?.createdAt,
      updatedAt: row.meta?.updatedAt,
      barcode: row.meta?.barcode,
      qrCode: row.meta?.qrCode,
    },
    images: row.images ?? [],
    thumbnail: row.thumbnail ?? "",
  };
}

export type StockFilter = "in" | "low" | "out";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  stock?: StockFilter;
  search?: string;
}

// Paginated product list with the same filters and response shape as the
// old JSON server endpoint (newest first, category included).
export async function getProducts({
  page = 1,
  limit = 6,
  categoryId,
  stock,
  search,
}: GetProductsParams = {}): Promise<ProductsResponse> {
  const from = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, from + limit - 1);

  if (categoryId) query = query.eq("category_id", categoryId);

  // Same thresholds as the summary cards: >10 in stock, 1-10 low, 0 out
  if (stock === "in") query = query.gte("stock", 11);
  if (stock === "low") query = query.gte("stock", 1).lte("stock", 10);
  if (stock === "out") query = query.eq("stock", 0);

  // Commas and parentheses would break the .or() filter syntax, so strip them
  const term = search?.trim().replace(/[,()]/g, " ");
  if (term) {
    query = query.or(
      `title.ilike.%${term}%,brand.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Unable to load products: ${error.message}`);

  const total = count ?? 0;
  return {
    products: (data ?? []).map(toProduct),
    total,
    limit,
    page,
    pages: Math.ceil(total / limit),
  };
}

// Stock counts for the summary cards. Only fetches the stock column instead of
// every full product like the old /products?_limit=1000 call did.
export async function getStockSummary() {
  const { data, error } = await supabase.from("products").select("stock");
  if (error) throw new Error(`Unable to load stock summary: ${error.message}`);

  return (data ?? []).reduce(
    (acc, { stock }) => {
      const itemCount = stock ?? 0;
      if (itemCount > 10) acc.inStock++;
      else if (itemCount > 0) acc.lowStock++;
      else acc.outOfStock++;
      return acc;
    },
    { total: data?.length ?? 0, inStock: 0, lowStock: 0, outOfStock: 0 },
  );
}

// Single product with its category and reviews embedded in one round trip.
// Replaces the JSON server's /products/:id?_expand=category.
export async function getProduct(productId: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), reviews(*)")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load product ${productId}: ${error.message}`);

  return data ? toProduct(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (data ?? []).map((row) => ({ ...row, image: row.image ?? "" }));
}

// Matches productSchema in app/lib/validation.ts: brand, sku, warranty,
// description and the two numbers are optional, the rest is required.
export interface UpdateProductPayload {
  title: string;
  brand?: string;
  price: number;
  stock: number;
  sku?: string;
  categoryId: number;
  warrantyInformation?: string;
  tags: string[];
  thumbnail: string;
  description?: string;
  weight?: number;
  rating?: number;
}

// Writes go through the cookie-based client, not the shared anon client, so the
// caller's session is sent and RLS decides whether the row may be changed.
// Both throw on failure; the server actions translate that into form errors.
//
// Every write is read back afterwards. An update that RLS rejects returns zero
// rows and no error, so trusting the absence of an error would let a blocked (or
// mistyped id) write report success and silently keep the old values.
export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      title: payload.title,
      brand: payload.brand || null,
      price: payload.price,
      stock: payload.stock,
      sku: payload.sku || null,
      category_id: payload.categoryId,
      warranty_information: payload.warrantyInformation || null,
      description: payload.description || null,
      tags: payload.tags,
      thumbnail: payload.thumbnail,
      ...(payload.weight === undefined ? {} : { weight: payload.weight }),
      ...(payload.rating === undefined ? {} : { rating: payload.rating }),
    })
    .eq("id", productId);

  if (error) {
    throw new Error(`Unable to update product ${productId}: ${error.message}`);
  }

  const { data: saved, error: readError } = await supabase
    .from("products")
    .select("title, price, stock")
    .eq("id", productId)
    .maybeSingle();

  if (readError) {
    throw new Error(
      `Product ${productId} was updated but could not be read back: ${readError.message}`,
    );
  }

  if (
    !saved ||
    saved.title !== payload.title ||
    saved.price !== payload.price ||
    saved.stock !== payload.stock
  ) {
    throw new Error(
      `Update to product ${productId} was rejected (missing product, or an RLS policy that does not allow this user to update it)`,
    );
  }
}

export async function updateProductStock(
  productId: number,
  stock: number,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", productId);

  if (error) {
    throw new Error(`Unable to update stock for product ${productId}: ${error.message}`);
  }

  const { data: saved, error: readError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .maybeSingle();

  if (readError) {
    throw new Error(
      `Stock for product ${productId} was updated but could not be read back: ${readError.message}`,
    );
  }

  if (!saved || saved.stock !== stock) {
    throw new Error(
      `Stock update for product ${productId} was rejected (missing product, or an RLS policy that does not allow this user to update it)`,
    );
  }
}
