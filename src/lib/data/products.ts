import { getSupabase } from "./_client";
import type { Product, ProductsResponse } from "@/app/admin/types";
import type { CategoryRow, ProductRow, ReviewRow } from "@/types/database";

// ---------------------------------------------------------------------------
// products — the single entry point for every read from and write to the
// Supabase `products` table (T89).
//
// Server-only: every function below runs on the server with the shared
// cookie-aware client from `./_client` (see `src/lib/supabase/server.ts`),
// so RLS policies always see the caller's real session. Pages, server
// actions and components must import these functions instead of building
// `supabase.from("products")` queries of their own.
//
// Row -> app type mapping: Supabase stores snake_case columns and a flat
// `meta` object; the app uses the camelCase `Product` type. `toProduct`
// converts here so components never see raw rows.
// ---------------------------------------------------------------------------

type ProductRowWithRelations = ProductRow & {
  category?: CategoryRow | null;
  reviews?: ReviewRow[] | null;
};

/**
 * Converts one raw `products` row (snake_case, with optional embedded
 * `category` and `reviews` relations) into the camelCase `Product` type used
 * by the app. Nulls become `undefined` or empty defaults so consumers can
 * render without null checks.
 */
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

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Thrown when a write reached the database but was rejected: either the row
 * does not exist, or a row-level security (RLS) policy denied it.
 *
 * Supabase reports both cases the same way — no error, zero affected rows —
 * so every write in this module is read back afterwards, and a mismatch
 * throws this error. Callers (server actions) translate it into a form
 * error instead of reporting a write as successful.
 */
export class WriteRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriteRejectedError";
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Stock status filter for {@link getProducts}, using the same thresholds as
 * the admin dashboard summary cards: more than 10 in stock, 1-10 low, 0 out.
 */
export type StockFilter = "in" | "low" | "out";

/**
 * Column a product list is ranked by. `newest` is the catalogue default
 * (newest rows first); the other two back the landing page rows, where the
 * heading names the ranking.
 */
export type ProductSort = "newest" | "discount_percentage" | "rating";

export interface GetProductsParams {
  /** 1-based page number. Defaults to 1. */
  page?: number;
  /** Rows per page. Defaults to 6. */
  limit?: number;
  /** Only products in this category. */
  categoryId?: number;
  /** Filter by stock status (>10 / 1-10 / 0). */
  stock?: StockFilter;
  /** Case-insensitive match on title, brand, SKU or description. */
  search?: string;
  /** Ranking column. Defaults to `newest`. */
  sort?: ProductSort;
  /** Product ids to leave out. Used by the landing page so a product is never
   * shown twice on the same page. */
  excludeIds?: number[];
}

/**
 * Paginated product list with the category relation embedded. Ranked newest
 * first unless `sort` asks for another column, in which case products with a
 * null value in that column sort last.
 * Returns the app-level `Product` objects plus pagination info.
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/admin/page.tsx (server component)
 * import { getProducts, type StockFilter } from "@/lib/data";
 *
 * const params = await searchParams;
 * const { products, total, pages } = await getProducts({
 *   page: Number(params.page ?? 1),
 *   limit: 6,
 *   categoryId: params.categoryId ? Number(params.categoryId) : undefined,
 *   stock: STOCK_FILTERS.find((s) => s === params.stock),
 *   search: params.search,
 * });
 * return <ProductTable products={products} currentPage={...} totalPages={pages} totalItems={total} pageSize={6} />;
 * ```
 */
export async function getProducts({
  page = 1,
  limit = 6,
  categoryId,
  stock,
  search,
  sort = "newest",
  excludeIds,
}: GetProductsParams = {}): Promise<ProductsResponse> {
  const supabase = await getSupabase();
  const from = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, category:categories(*), reviews(*)", { count: "exact" })
    .range(from, from + limit - 1);

  // nullsFirst:false keeps undiscounted/unrated products out of the top slots,
  // and the id tie-breaker keeps rows stable when many products share a value.
  if (sort === "newest") {
    query = query.order("id", { ascending: false });
  } else {
    query = query
      .order(sort, { ascending: false, nullsFirst: false })
      .order("id", { ascending: true });
  }

  // Applied before the range so the page still gets `limit` fresh products.
  // PostgREST wants the values as a parenthesised list, and an empty list is a
  // syntax error, hence the length check.
  if (excludeIds?.length) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

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

/**
 * The minimum a landing page promo tile needs: an id to link to, a title for
 * the alt text and the thumbnail itself. Deliberately narrower than
 * {@link getProducts}, which embeds the category and every review — a promo
 * collage only renders images.
 */
export interface PromoProduct {
  id: number;
  title: string;
  thumbnail: string;
  /** Percentage off, if the product is discounted. */
  discountPercentage?: number;
}

export interface GetPromoProductsParams {
  /** Rows to return. Defaults to 4 (a 2x2 collage). */
  limit?: number;
  /** Ranking column, so the collage matches the promo headline. Defaults to
   * `discount_percentage`. */
  sort?: ProductSort;
  /** Product ids already shown elsewhere on the page, so the collage promotes
   * different products than the rows above it. */
  excludeIds?: number[];
}

/**
 * A small ranked slice of products for the landing page promo collage,
 * selecting only the three columns the tiles read.
 *
 * Rows without a thumbnail are dropped, because `next/image` rejects an empty
 * `src` and the collage has no meaningful placeholder.
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/components/landing/promo-section.tsx (server component)
 * const tiles = await getPromoProducts({
 *   sort: "discount_percentage",
 *   excludeIds: productsShownInTheRows,
 * });
 * ```
 */
export async function getPromoProducts({
  limit = 4,
  sort = "discount_percentage",
  excludeIds,
}: GetPromoProductsParams = {}): Promise<PromoProduct[]> {
  const supabase = await getSupabase();

  let query = supabase
    .from("products")
    .select("id, title, thumbnail, discount_percentage")
    .not("thumbnail", "is", null)
    .order(sort, { ascending: false, nullsFirst: false })
    .order("id", { ascending: true });

  // Runs before the limit, so excluding the rows above promotes the next best
  // matches instead of leaving the collage short. An empty list is a PostgREST
  // syntax error, so it is only sent when there is something to exclude.
  if (excludeIds?.length) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query.limit(limit);

  if (error) throw new Error(`Unable to load promo products: ${error.message}`);

  return (data ?? [])
    .filter((row) => (row.thumbnail ?? "") !== "")
    .map((row) => ({
      id: row.id,
      title: row.title,
      thumbnail: row.thumbnail as string,
      discountPercentage: row.discount_percentage ?? undefined,
    }));
}

export interface StockSummary {
  /** Number of products with stock > 10. */
  inStock: number;
  /** Number of products with stock 1-10. */
  lowStock: number;
  /** Number of products with stock 0. */
  outOfStock: number;
  /** Total number of products. */
  total: number;
}

/**
 * Stock counts for the admin dashboard summary cards. Fetches only the
 * `stock` column instead of every full product.
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/admin/page.tsx (server component)
 * const { inStock, lowStock, outOfStock, total } = await getStockSummary();
 * return <SummaryCards total={total} inStock={inStock} lowStock={lowStock} outOfStock={outOfStock} />;
 * ```
 */
export async function getStockSummary(): Promise<StockSummary> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("products").select("stock");
  if (error) throw new Error(`Unable to load stock summary: ${error.message}`);

  return (data ?? []).reduce<StockSummary>(
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

/**
 * Single product with its category and reviews embedded in one round trip.
 * Returns `null` when no product has the given id (so pages can `notFound()`).
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/(shop)/products/[id]/page.tsx (server component)
 * import { getProduct } from "@/lib/data";
 * import { notFound } from "next/navigation";
 *
 * const product = await getProduct(productId);
 * if (!product) notFound();
 * return <ProductDetail product={product} />;
 * ```
 */
export async function getProduct(productId: number): Promise<Product | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), reviews(*)")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load product ${productId}: ${error.message}`);

  return data ? toProduct(data) : null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/**
 * Payload for {@link createProduct}. Matches what the admin "add product"
 * form submits (brand, SKU, warranty, description and tags are not part of
 * the insert yet).
 */
export interface CreateProductPayload {
  title: string;
  price: number;
  stock: number;
  categoryId: number;
  thumbnail: string;
  weight?: number;
  rating?: number;
}

/**
 * Inserts a new product and returns its id.
 *
 * Uses the cookie-aware client, so the insert is subject to RLS. An insert
 * that RLS rejects surfaces as a database error (no row is returned), which
 * is thrown.
 *
 * @example
 * ```ts
 * // src/app/admin/actions/productActions.ts (server action)
 * import { createProduct } from "@/lib/data";
 *
 * try {
 *   const id = await createProduct({ title, price, stock, categoryId, thumbnail, weight, rating });
 *   revalidatePath("/");
 *   return { success: true, error: null, createdId: id };
 * } catch (error) {
 *   console.error("Failed to add product to Supabase:", error);
 *   return { success: false, error: "The product could not be added. Please try again." };
 * }
 * ```
 */
export async function createProduct(payload: CreateProductPayload): Promise<number> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("products")
    .insert({
      title: payload.title,
      price: payload.price,
      stock: payload.stock,
      // Map camelCase payload to the snake_case column
      category_id: payload.categoryId,
      thumbnail: payload.thumbnail,
      ...(payload.weight === undefined ? {} : { weight: payload.weight }),
      ...(payload.rating === undefined ? {} : { rating: payload.rating }),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `Unable to add product: ${error?.message ?? "no id returned"}`,
    );
  }

  return data.id;
}

/**
 * Matches `productSchema` in `src/app/admin/lib/validation.ts`: brand, sku,
 * warranty, description and the two numbers are optional, the rest required.
 */
export interface UpdateProductPayload {
  title: string;
  brand?: string;
  price: number;
  stock: number;
  sku?: string;
  categoryId: number;
  warrantyInformation?: string;
  tags?: string[];
  thumbnail: string;
  description?: string;
  weight?: number;
  rating?: number;
}

/**
 * Updates a product from the edit form.
 *
 * Runs on the cookie-aware client, so RLS decides whether the row may be
 * changed. The update is read back afterwards: an update that RLS rejects
 * (or that targets a missing id) affects zero rows without an error, so
 * trusting the absence of an error would report success while the old values
 * stay in the database.
 *
 * Throws on database errors and on rejected writes ({@link WriteRejectedError}).
 *
 * @example
 * ```ts
 * // src/app/admin/product/edit/[id]/actions.ts (server action)
 * import { updateProduct } from "@/lib/data";
 *
 * try {
 *   await updateProduct(productId, {
 *     title, price, stock, categoryId, thumbnail,
 *     ...(brand === undefined ? {} : { brand }),
 *     // ...remaining optional fields
 *   });
 *   revalidatePath(`/product/${productId}`);
 *   redirect(`/product/${productId}`);
 * } catch (error) {
 *   return { values: rawValues, errors: {}, formError: "The product could not be updated. Please try again." };
 * }
 * ```
 */
export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload,
): Promise<void> {
  const supabase = await getSupabase();

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
    throw new WriteRejectedError(
      `Update to product ${productId} was rejected (missing product, or an RLS policy that does not allow this user to update it)`,
    );
  }
}

/**
 * Updates only the stock column (admin stock edit). Same read-back
 * verification as {@link updateProduct}.
 *
 * Throws on database errors and on rejected writes ({@link WriteRejectedError}).
 *
 * @example
 * ```ts
 * // src/app/admin/components/ProductDetail/actions.ts (server action)
 * import { updateProductStock } from "@/lib/data";
 *
 * try {
 *   await updateProductStock(productId, result.data.stock);
 *   revalidatePath(`/product/${productId}`);
 *   return { success: true };
 * } catch (error) {
 *   return { error: "Stock could not be updated. Please try again." };
 * }
 * ```
 */
export async function updateProductStock(
  productId: number,
  stock: number,
): Promise<void> {
  const supabase = await getSupabase();

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
    throw new WriteRejectedError(
      `Stock update for product ${productId} was rejected (missing product, or an RLS policy that does not allow this user to update it)`,
    );
  }
}

/**
 * Deletes a product by id.
 *
 * Runs on the cookie-aware client and verifies the row is actually gone: a
 * delete that RLS rejects (or that targets a missing id) returns no error,
 * so the row is read back afterwards.
 *
 * @throws Error on database errors.
 * @throws WriteRejectedError when the row still exists after the delete
 * (missing product, or an RLS policy that does not allow this user to delete
 * it) — callers can use this to show a specific "not allowed" message.
 *
 * @example
 * ```ts
 * // src/app/admin/actions/productActions.ts (server action)
 * import { deleteProduct, WriteRejectedError } from "@/lib/data";
 *
 * try {
 *   await deleteProduct(productId);
 *   revalidatePath("/");
 *   return { success: true, error: null };
 * } catch (error) {
 *   if (error instanceof WriteRejectedError) {
 *     return { success: false, error: "The product could not be deleted. You are not allowed to delete it." };
 *   }
 *   return { success: false, error: "The product could not be deleted. Please try again." };
 * }
 * ```
 */
export async function deleteProduct(productId: number): Promise<void> {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(`Unable to delete product ${productId}: ${error.message}`);
  }

  const { data: stillThere, error: readError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (readError) {
    throw new Error(
      `Product ${productId} was deleted but could not be read back: ${readError.message}`,
    );
  }

  if (stillThere) {
    throw new WriteRejectedError(
      `Product ${productId} could not be deleted (missing product, or an RLS policy that does not allow this user to delete it)`,
    );
  }
}
