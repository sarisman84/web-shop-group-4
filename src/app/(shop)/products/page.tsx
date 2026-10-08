import { Product } from "@/types/product";
import CatalogFilter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import {
  getCatalogFacets,
  getCategories,
  getProducts,
  ProductsFetchError,
  PGRST_RANGE_NOT_SATISFIABLE,
} from "@/lib/data";
import { getFirst, parseFilters, toGetProductsParams } from "@/lib/catalog-filters";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { readWishlist } from "@/lib/wishlist-cookie";
import { redirect } from "next/navigation";
import ProductCard from "@/components/catalog/product-card";
import Breadcrumbs, {
  type BreadcrumbItem,
} from "@/components/catalog/breadcrumbs";
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
  // The header's search bar writes ?search=<term>; the filter panel does not
  // manage it, so read it straight from the URL and hand it to the data layer.
  // getFirst takes the first value when the param is repeated (?search=a&search=b).
  const searchQuery = getFirst(params, "search")?.trim() || undefined;
  const filterParams = toGetProductsParams(filters, {
    categories,
    search: searchQuery,
  });

  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const requestedPage = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);

  // PostgREST answers 416 ("Requested range not satisfiable") when the
  // requested page lies past the end of the result set; supabase-js surfaces
  // it as error code PGRST103, so a stale ?page= (e.g. from a previously
  // larger unfiltered listing) surfaces as a ProductsFetchError with that
  // code. Redirect to page 1 (keeping the other filters) instead of fetching
  // page 1 here: the redirect re-runs this component at page 1, so a page-1
  // fetch now would only be discarded. Page 1 of any result set — even an
  // empty one — returns 200, so the redirect always lands on a renderable
  // page. Any other error is a real database failure and is rethrown.
  let result;
  try {
    result = await getProducts({
      ...filterParams,
      page: requestedPage,
      limit: ITEMS_PER_PAGE,
    });
  } catch (error) {
    if (
      !(error instanceof ProductsFetchError) ||
      error.code !== PGRST_RANGE_NOT_SATISFIABLE
    ) {
      throw error;
    }
    // Keep every other active filter (category, search, brand, ...) and only
    // drop the stale page, so the URL matches the page the redirect renders.
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) query.append(key, item);
      } else {
        query.append(key, value);
      }
    }
    const qs = query.toString();
    redirect(qs ? `/products?${qs}` : "/products");
  }
  const { products, pages, total } = result;
  const totalPages = Math.max(1, pages);
  const currentPage = requestedPage;

  const wishlist = await readWishlist();
  const items = products.map(toCardItem);

  // Breadcrumb trail reflects the active filters. "Start" goes to the landing
  // page, "Katalog" clears all filters, and the group level links to its
  // filtered view. Category, search and sale segments are terminal (plain
  // text); only the very last segment gets aria-current="page" (handled by
  // the Breadcrumbs component). Unknown slugs fall back to "Alla produkter".
  const matchedCategory = categories.find(
    (c) => c.slug === filters.categories[0],
  );
  const explicitGroup = NAV_GROUPS.find((g) => g.slug === filters.group);
  const inferredGroup = filters.categories[0]
    ? NAV_GROUPS.find((g) =>
        g.categorySlugs.includes(filters.categories[0]),
      )
    : undefined;
  const activeGroup = explicitGroup ?? inferredGroup;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Start", href: "/" },
    { label: "Katalog", href: "/products" },
  ];
  // Terminal (non-link) segments after the group level, in display order.
  const terminalLabels: string[] = [];
  if (activeGroup && matchedCategory) {
    breadcrumbItems.push({
      label: activeGroup.title,
      href: `/products?group=${encodeURIComponent(activeGroup.slug)}`,
    });
    terminalLabels.push(matchedCategory.name);
  } else if (!activeGroup && matchedCategory) {
    // Category outside every nav group ("Övrigt"): skip the group level.
    terminalLabels.push(matchedCategory.name);
  }
  if (searchQuery) {
    terminalLabels.push(`Sökresultat för "${searchQuery}"`);
  }
  if (filters.sale) {
    terminalLabels.push("Rea");
  }
  if (activeGroup && !matchedCategory) {
    if (terminalLabels.length > 0) {
      breadcrumbItems.push({
        label: activeGroup.title,
        href: `/products?group=${encodeURIComponent(activeGroup.slug)}`,
      });
    } else {
      // Group alone is the current page.
      breadcrumbItems.push({ label: activeGroup.title });
    }
  }
  for (const label of terminalLabels) {
    breadcrumbItems.push({ label });
  }
  if (breadcrumbItems.length === 2) {
    breadcrumbItems.push({ label: "Alla produkter" });
  }

  return (
    <main className="flex flex-col justify-center items-stretch bg-bg-page pb-10">
      <CategoryIntroduction
        title="Teknik"
        subtitle="Lorem ipsum dolor sit amet consectetur. Risus risus vitae quam molestie dui. Rhoncus nec pellentesque tempus sit donec. Vitae massa porttitor integer quisque est augue tristique. Id consequat viverra tincidunt erat a malesuada nisl."
      />
      <div className="px-16">
        <div className="mx-auto w-full max-w-content">
          <Breadcrumbs items={breadcrumbItems} />

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
