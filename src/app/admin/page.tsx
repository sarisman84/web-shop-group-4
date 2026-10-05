import { Suspense } from "react";
import Header from "./components/Header/Header";
import SummaryCards from "./components/Summary-card/SummaryCard";
import SearchBar from "./components/SearchBar";
import ProductTable from "./components/ProductTable";
import {
  getCategories,
  getProducts,
  getStockSummary,
  type StockFilter,
} from "@/lib/data";

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

  // 2. Categories for the SearchBar filter dropdown, stock counts for the
  // summary cards and the paginated product table all come from the data
  // layer (src/lib/data) — no direct Supabase queries in the page.
  const [categories, summary, response] = await Promise.all([
    getCategories(),
    getStockSummary(),
    getProducts({
      page: currentPage,
      limit: DEFAULT_LIMIT,
      categoryId,
      stock,
      search: params.search,
    }),
  ]);

  return (
    <main>
      <Header />
      <SummaryCards
        total={summary.total}
        inStock={summary.inStock}
        lowStock={summary.lowStock}
        outOfStock={summary.outOfStock}
      />
      <Suspense fallback={<div className="h-10" aria-hidden="true" />}>
        <SearchBar categories={categories} />
      </Suspense>
      <div className="page-container">
          <Suspense
           fallback={
            <p className="py-4 text-sm text-gray-400" aria-hidden="true">
              Laddar...
            </p>
          }
        >
          <ProductTable
            products={response.products}
            currentPage={currentPage}
            totalPages={response.pages}
            totalItems={response.total}
            pageSize={DEFAULT_LIMIT}
          />
        </Suspense>
      </div>
    </main>
  );
}
