import { getSupabase } from "./_client";
import type { Category } from "@/app/admin/types";

// ---------------------------------------------------------------------------
// categories — the single entry point for reads from the Supabase
// `categories` table (T89).
//
// Server-only: runs on the shared cookie-aware client from `./_client` (see
// `src/lib/supabase/server.ts`). Pages and components must import this
// function instead of building `supabase.from("categories")` queries of
// their own.
// ---------------------------------------------------------------------------

/**
 * All categories ordered by id, mapped to the app-level `Category` type
 * (a null `image` column becomes an empty string so consumers don't need a
// fallback).
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/(shop)/layout.tsx (server layout)
 * import { getCategories } from "@/lib/data";
 *
 * export default async function ShopLayout({ children }: { children: React.ReactNode }) {
 *   const categories = await getCategories();
 *   return (
 *     <>
 *       <ShopHeader categories={categories} />
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (data ?? []).map((row) => ({ ...row, image: row.image ?? "" }));
}
