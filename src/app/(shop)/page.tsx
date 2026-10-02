import Hero from "@/components/header/hero";
import { getCategories, getProducts } from "@/lib/data";
import type { Product } from "@/app/admin/types";

// The landing page lists every match for the active category/search, so it
// asks the data layer for a large page instead of paginating.
const MAX_RESULTS = 1000;

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  // 1. Safely resolve searchParams for filtering & searching
  const resolvedParams = searchParams ? await searchParams : {}
  const categoryParam = resolvedParams.category
  const searchParam = resolvedParams.search

  const selectedCategory = typeof categoryParam === 'string' ? categoryParam : undefined
  const searchQuery = typeof searchParam === 'string' ? searchParam : undefined

  // 2. Category links in the header use the category name; resolve it to the
  // id the products table stores (unknown names simply show all products).
  let categoryId: number | undefined;
  if (selectedCategory) {
    const categories = await getCategories();
    categoryId = categories.find((category) => category.name === selectedCategory)?.id;
  }

  // 3. Fetch the matching products through the data layer
  let products: Product[] = [];
  let loadError: unknown = null;
  if (searchQuery || categoryId) {
    try {
      const response = await getProducts({
        categoryId,
        search: searchQuery,
        limit: MAX_RESULTS,
      });
      products = response.products;
    } catch (error) {
      console.error("Error fetching products:", error);
      loadError = error;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
        {(searchQuery || categoryId) && (
          <>
            {searchQuery && (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
                Sökresultat för &quot;{searchQuery}&quot;
              </h1>
            )}

            {loadError ? (
              <p className="text-red-500 text-sm">Kunde inte ladda produkter från databasen.</p>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
                    <h2 className="font-semibold text-gray-800">{product.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{product.price} kr</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Inga produkter hittades.</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
