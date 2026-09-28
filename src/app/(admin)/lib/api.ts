import { supabase } from "@/app/lib/supabase";
import type { Category, Product, ProductsResponse } from "@/app/types";
import type { CategoryRow, ProductRow } from "@/app/types/database";

// TODO (T41 follow-up): getProduct, updateProduct and updateProductStock still
// use the JSON server. The ticket only covers the product list; move the single
// product view and the edit/stock writes together, otherwise the edit page
// would show Supabase data but save to the JSON server.
const API_URL = "http://localhost:4000";

// Supabase stores snake_case columns and a flat meta; the app uses the
// camelCase Product type. Convert here so components don't need to change.
function toProduct(row: ProductRow & { category?: CategoryRow | null }): Product {
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
    returnPolicy: row.return_policy ?? undefined,
    minimumOrderQuantity: row.minimum_order_quantity ?? undefined,
    meta: {
      createdAt: row.meta_created_at,
      updatedAt: row.meta_updated_at,
      barcode: row.barcode ?? undefined,
      qrCode: row.qr_code ?? undefined,
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

export async function getProduct(productId: number): Promise<Product | null> {
  const response = await fetch(
    `${API_URL}/products/${productId}?_expand=category`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Unable to load product ${productId}`);

  return (await response.json()) as Product;
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

export interface UpdateProductPayload {
  title: string;
  brand: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: number;
  warrantyInformation: string;
  tags: string[];
  thumbnail: string;
  description: string;
  weight?: number;
  rating?: number;
}

export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload,
): Promise<Response> {
  return fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateProductStock(
  productId: number,
  stock: number,
): Promise<Response> {
  return fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });
}
