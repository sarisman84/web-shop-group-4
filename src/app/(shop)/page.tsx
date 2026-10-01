import { createClient } from '@/utils/supabase/server'
import ShopHeader from '@/components/header/shop-header'
import Hero from '@/components/header/hero'

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  // 1. Initialize the Supabase client
  const supabase = await createClient()

  // 2. Safely resolve searchParams for filtering & searching
  const resolvedParams = searchParams ? await searchParams : {}
  const categoryParam = resolvedParams.category
  const searchParam = resolvedParams.search

  const selectedCategory = typeof categoryParam === 'string' ? categoryParam : undefined
  const searchQuery = typeof searchParam === 'string' ? searchParam : undefined

  // 3. Fetch categories from Supabase
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('*')

  if (categoryError) {
    console.error('Error fetching categories:', categoryError)
  }

  // 4. Build product query using 'category_id' for category relationship
  let query = supabase.from('products').select('*')
  
  if (selectedCategory) {
    const { data: matchedCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', selectedCategory)
      .single()

    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  // Text search filter using your exact 'title' column
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data: products, error: productError } = await query

  if (productError) {
    console.error('Error fetching products:', productError)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Pass the dynamically fetched categories into your ShopHeader */}
      <ShopHeader categories={categories || []} />
      
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          {searchQuery
            ? `Sökresultat för "${searchQuery}"`
            : selectedCategory
            ? `Kategori: ${selectedCategory}`
            : 'Utvalda Produkter'}
        </h1>

        {productError ? (
          <p className="text-red-500 text-sm">Kunde inte ladda produkter från databasen.</p>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
                {/* Render using your 'title' column */}
                <h2 className="font-semibold text-gray-800">{product.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{product.price} kr</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Inga produkter hittades.</p>
        )}
      </main>
    </div>
  )
}