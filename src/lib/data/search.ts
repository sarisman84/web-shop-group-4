import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ---------------------------------------------------------------------------
// search — client-safe product search (T89).
//
// This is the only query in the data layer that runs in the browser: the
// header search bar is a client component, and client components must use
// the browser client from `src/lib/supabase/client.ts` (never the
// cookie-aware server client, which needs request cookies).
//
// To keep ALL `supabase.from(...)` calls inside `src/lib/data/` (the T89
// definition of done), the query takes the caller's Supabase client as a
// parameter instead of creating one itself. The client component creates
// exactly one browser client and passes it in.
// ---------------------------------------------------------------------------

/** A product row matched by {@link searchProducts}, with the category name embedded. */
export type SearchHit = Database["public"]["Tables"]["products"]["Row"] & {
  categories?: { name: string } | null;
};

/**
 * Case-insensitive title/description search used by the header search bar.
 * Returns at most 20 matching product rows; the caller only uses the result
 * to decide whether to navigate (an empty result still navigates, so the
 * landing page can show "no results").
 *
 * @param query The search term (empty/whitespace-only terms return no hits).
 * @param supabase The browser client created by the client component via
 *   `createClient()` from `src/lib/supabase/client.ts`.
 * @throws on database errors — the caller decides how to degrade.
 *
 * @example
 * ```tsx
 * // src/components/header/search-bar.tsx (client component)
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 * // Not the @/lib/data barrel: that re-exports server-only modules.
 * import { searchProducts } from "@/lib/data/search";
 *
 * const supabase = createClient(); // one browser client for this component
 *
 * const handleSearch = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   const query = searchQuery.trim();
 *   if (!query) {
 *     router.push("/");
 *     return;
 *   }
 *   try {
 *     await searchProducts(query, supabase);
 *   } catch (error) {
 *     console.error("Search error:", error);
 *   }
 *   router.push(`/?search=${encodeURIComponent(query)}`);
 * };
 * ```
 */
export async function searchProducts(
  query: string,
  supabase: SupabaseClient<Database>,
): Promise<SearchHit[]> {
  const term = query.trim();
  if (!term) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(20);

  if (error) {
    throw new Error(`Unable to search products: ${error.message}`);
  }

  return (data ?? []) as SearchHit[];
}
