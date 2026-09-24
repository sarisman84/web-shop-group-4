import type { Category } from "./types";
import Header from "./components/Header/Header";
import SummaryCards from "./components/Summary-card/SummaryCard";
import SearchBar from "./components/SearchBar";
import ProductTable from "./components/ProductTable";
import {
  getCategories,
  getProducts,
  getStockSummary,
  type StockFilter,
} from "@/app/lib/api";

const DEFAULT_LIMIT = 6;
const STOCK_FILTERS: StockFilter[] = ["in", "low", "out"];

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
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;
  const stock = STOCK_FILTERS.find((s) => s === params.stock);

  // 2. Parallel fetch from Supabase (via app/lib/api.ts). Product and summary
  // errors throw so the page shows an error instead of misleading zeros;
  // categories fall back to [] since the page still works without the filter.
  const [paginatedData, summary, categoriesData] = await Promise.all([
    getProducts({
      page: currentPage,
      limit: DEFAULT_LIMIT,
      categoryId,
      stock,
      search: params.search,
    }),
    getStockSummary(),
    getCategories().catch((err): Category[] => {
      console.error("Failed to load categories:", err);
      return [];
    }),
  ]);

  const { products, total, page, pages, limit } = paginatedData;

  return (
    <main>
      <Header />
      <SummaryCards
        total={summary.total}
        inStock={summary.inStock}
        lowStock={summary.lowStock}
        outOfStock={summary.outOfStock}
      />
      <SearchBar categories={categoriesData} />
      <div className="page-container">
        <ProductTable
          products={products}
          currentPage={page}
          totalPages={pages}
          totalItems={total}
          pageSize={limit}
        />
      </div>
    </main>
  );
}
