import { Product } from "@/types/product";
import CatalogFilter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getCatalogFacets, getCategories, getProducts } from "@/lib/data";
import { parseFilters, toGetProductsParams } from "@/lib/catalog-filters";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { readWishlist } from "@/lib/wishlist-cookie";
import ProductCard from "@/components/catalog/product-card";
import CategoryIntroduction from "@/components/header/category-introduction";
import type { Product as AppProduct } from "@/app/admin/types";

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

  // The navbar and filter panel write ?group=, ?category=<slug>, ?brand=,
  // ?minPrice=, etc. parseFilters reads them into a typed object and
  // toGetProductsParams turns that into getProducts parameters (resolving
  // category slugs to ids via the loaded categories).
  const filters = parseFilters(params);
  const [categories, facets] = await Promise.all([
    getCategories(),
    getCatalogFacets(),
  ]);
  const filterParams = toGetProductsParams(filters, { categories });

  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const requestedPage = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);

  const [first, wishlist] = await Promise.all([
    getProducts({ ...filterParams, page: requestedPage, limit: ITEMS_PER_PAGE }),
    readWishlist(),
  ]);
  const totalPages = Math.max(1, first.pages);
  const currentPage = Math.min(totalPages, requestedPage);
  const { products, total } =
    currentPage === requestedPage
      ? first
      : await getProducts({ ...filterParams, page: currentPage, limit: ITEMS_PER_PAGE });
  const items = products.map(toCardItem);

  // Breadcrumb reflects the active filter: the nav group, the first selected
  // category, or the sale flag. Unknown slugs fall back to "Alla produkter".
  const group = NAV_GROUPS.find((g) => g.slug === filters.group);
  const matchedCategory = categories.find((c) => c.slug === filters.categories[0]);
  const crumb = group
    ? group.title
    : matchedCategory
      ? matchedCategory.name
      : filters.sale
        ? "Rea"
        : "Alla produkter";

  return (
    <main className="flex flex-col justify-center items-stretch bg-bg-page pb-10">
      <CategoryIntroduction
        title="Teknik"
        subtitle="Lorem ipsum dolor sit amet consectetur. Risus risus vitae quam molestie dui. Rhoncus nec pellentesque tempus sit donec. Vitae massa porttitor integer quisque est augue tristique. Id consequat viverra tincidunt erat a malesuada nisl."
      />
      <div className="px-16">
        <div className="mx-auto w-full max-w-content">
          <nav className="mb-4 pb-2 pt-4 border-b border-border-default">
            <p className="text-sm text-text-secondary">
              Start / Katalog / {crumb}
            </p>
          </nav>

          <div className="mb-4 row-between">
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

          <div className="flex w-full flex-row gap-8">
            <CatalogFilter
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              brands={facets.brands}
              priceBounds={facets.priceBounds}
            />
            {items.length > 0 ? (
              <GridCollection
                className="min-w-0 flex-1"
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
                renderItem={(item: Product, index: number) => (
                  <ProductCard
                    data={item}
                    wishlisted={wishlist.includes(item.id)}
                    mediaHeight="catalogue"
                    eager={index < 3}
                  />
                )}
              />
            ) : (
              <p className="text-gray-500 text-sm">Inga produkter hittades.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
