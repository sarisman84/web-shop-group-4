import { unstable_cache } from "next/cache";
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
 * fallback, and a null `description` becomes an empty string for the same
 * reason).
 *
 * Throws on database errors.
 *
 * example
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
async function fetchCategories(): Promise<Category[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("id");

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    ...row,
    image: row.image ?? "",
    description: row.description ?? "",
  }));
}

// Categories are static catalog data (edited in the Supabase dashboard, not
// through the app), and the shop layout fetches them on EVERY page render —
// a network round trip per click. Cache them for an hour so navigations stop
// paying for the query; a cache miss revalidates in the background.
export const getCategories = unstable_cache(
  fetchCategories,
  ["categories"],
  { revalidate: 3600 },
);