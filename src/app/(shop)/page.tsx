// import { Product } from "@/types/product";
// import Hero from "@/components/header/hero";
// import ProductGrid from "@/components/catalog/product-grid";
// import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  // const resolvedSearchParams = await searchParams;
  // const query = resolvedSearchParams.q?.toLowerCase() ?? "";
  // const supabase = await createClient();
  // let dbQuery = supabase.from("products").select("*");
  // if (query) {
  //   dbQuery = dbQuery.or(`name.ilike.%${query}%,category.ilike.%${query}%`);
  // }
  // const { data: products, error } = await dbQuery;
  // const filtered = (products as Product[]) ?? [];
  // return (
  //   <main className="flex flex-col items-stretch pb-10">
  //     <Hero />
  //     <div className="page-container">
  //       <div className="mb-4 pb-2 pt-4 border-b">
  //         <p>
  //           Start / Alla produkter{" "}
  //           {query && (
  //             <span className="text-gray-500">
  //               {" "}
  //               — sökning: &quot;{query}&quot;
  //             </span>
  //           )}
  //         </p>
  //       </div>
  //       {error && (
  //         <p className="py-4 text-center text-red-500">
  //           Ett fel uppstod vid hämtning från databasen: {error.message}
  //         </p>
  //       )}
  //       {filtered.length === 0 ? (
  //         <p className="py-10 text-center text-gray-500">
  //           Inga produkter matchar din sökning.
  //         </p>
  //       ) : (
  //         <ProductGrid products={filtered} />
  //       )}
  //     </div>
  //   </main>
  // );
}
