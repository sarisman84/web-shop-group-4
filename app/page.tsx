import type { Category, Product, ProductsResponse } from "./types";
import Header from "./components/Header/Header";
import SummaryCards from "./components/Summary-card/SummaryCard";
import SearchBar from "./components/SearchBar";
import ProductTable from "./components/ProductTable";
import { createClient } from "@/lib/supabase/server";
const DEFAULT_LIMIT = 6;
const API_BASE_URL = "http://localhost:4000";

interface HomeProps {
  searchParams: Promise<{
    page?: string;
    categoryId?: string;
    stock?: string;
    search?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // 1. Next.js 15 requirement: await searchParams
  const params = await searchParams;
  const currentPage = Number(params.page ?? 1);
  const categoryId = params.categoryId;
  const stock = params.stock;
  const search = params.search;

  const supabase = await createClient();
  // 1. Fetch categories for the SearchBar filter dropdown
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*");
  const categories = categoriesData ?? [];

  // 2. Fetch all products to calculate summary card counts accurately
  const { data: allProductsData } = await supabase
    .from("products")
    .select("*");
  const allProducts: Product[] = allProductsData ?? [];

  // Single-pass reduction for summary cards
  const summary = allProducts.reduce(
    (acc, item) => {
      const itemCount = item.stock ?? 0;
      if (itemCount > 10) acc.inStock++;
      else if (itemCount > 0) acc.lowStock++;
      else acc.outOfStock++;
      return acc;
    },
    { inStock: 0, lowStock: 0, outOfStock: 0 }
  );

  // 3. Build filtered query for the main product table with pagination
  let query = supabase
    .from("products")
    .select("*, category:category_id(*)", { count: "exact" });

  // Apply category filter if selected
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  // Build query filters
  const categoryFilter = categoryId ? `&categoryId=${categoryId}` : "";
  let stockFilter = "";

// Apply stock filter
  if (stock === "in") { query = query.gte("stock", 11);
  } else if (stock === "low") { query = query.gte("stock", 1).lte("stock", 10);
  } else if (stock === "out") { query = query.eq("stock", 0);}
  
  // Apply search text filter
  const searchFilter = search?.trim()
    ? `&q=${encodeURIComponent(search.trim())}`
    : "";

// Apply search text filter
  if (search?.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }
  // Apply sorting and pagination (Newest first)
  const from = (currentPage - 1) * DEFAULT_LIMIT;
  const to = from + DEFAULT_LIMIT - 1;

  const { data: paginatedProducts, count, error } = await query
    .order("id", { ascending: false })
    .range(from, to);
  if (error) {
    console.error("Error fetching products from Supabase:", error);
  }
  const products: Product[] = paginatedProducts ?? [];
 const total = Number(count ?? 0);
const pageSize = Number(DEFAULT_LIMIT);
   const pages = Math.ceil(total / pageSize) || 1;
  return (
    <main>
      <Header />
      <SummaryCards
        total={allProducts.length}
        inStock={summary.inStock}
        lowStock={summary.lowStock}
        outOfStock={summary.outOfStock}
      />
      <SearchBar categories={categories} />
      <div className="page-container">
         
         <ProductTable products={products}
          currentPage={currentPage}
          totalPages={pages}
          totalItems={total}
          pageSize={DEFAULT_LIMIT}
        />
      </div>
    </main>
  );
}