import { Product } from "@/types/product";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getProducts, getStockSummary } from "@/lib/data";
import ProductCard from "@/components/catalog/product-card";
import type { Product as AppProduct } from "@/app/admin/types";
import CategoryIntroduction from "@/components/header/category-introduction";

const ITEMS_PER_PAGE = 12;

// Maps a data-layer product (camelCase, from Supabase) to the card's
// display shape (src/types/product).
function toCardItem(product: AppProduct): Product {
  return {
    id: product.id,
    name: product.title,
    category: product.category?.name ?? "Uncategorized",
    price: product.price,
    currency: "SEK",
    image: product.thumbnail,
    review_count: product.reviews?.length ?? 0,
    review_sum: product.rating ?? 0,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Clamp the requested page to the real catalogue size, like the old
  // client-side pagination did (getStockSummary only reads the stock
  // column, so this stays cheap).
  const { total } = await getStockSummary();
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage),
  );

  const { products } = await getProducts({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const items = products.map(toCardItem);

  return (
    <main className="flex flex-col justify-center items-stretch bg-bg-page pb-10">
      <div className="px-15">
        <CategoryIntroduction
          title="Teknik"
          subtitle="Lorem ipsum dolor sit amet consectetur. Risus risus vitae quam molestie dui. Rhoncus nec pellentesque tempus sit donec. Vitae massa porttitor integer quisque est augue tristique. Id consequat viverra tincidunt erat a malesuada nisl."
        />
        <nav className="mb-4 pb-2 pt-4 border-b border-border-default">
          <p className="text-sm text-text-secondary">
            Start / Katalog / Alla produkter
          </p>
        </nav>

        <div className="mb-4 flex flex-row items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {total} produkter funna
          </span>
          <div className="flex flex-row gap-3">
            <button
              type="button"
              className="inline-flex flex-row items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-sm font-semibold text-text-primary"
            >
              Filter
            </button>
            <button
              type="button"
              className="inline-flex flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-text-primary"
            >
              Mest populära
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-6">
          <Filter />
          <GridCollection
            className="w-full"
            customGridClassName="grid grid-cols-3 grid-rows-4 gap-6"
            itemsPerPage={ITEMS_PER_PAGE}
            items={items}
            ariaLabel="products"
            currentPage={currentPage}
            totalPages={totalPages}
            paginationProps={{
              basePath: "/products",
              searchParams: params,
            }}
            renderItem={(item: Product, _: number) => (
              <ProductCard data={item} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
