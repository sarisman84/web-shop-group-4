import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import CatalogFilterPanel from "@/components/catalog/catalog-filter-panel";
import CatalogFilterSheetData from "@/components/catalog/catalog-filter-sheet-data";
import CatalogGrid from "@/components/catalog/catalog-grid";
import { CatalogGridSkeleton } from "@/components/catalog/catalog-grid-skeleton";
import {
  CatalogFilterChipSkeleton,
  CatalogFilterSkeleton,
} from "@/components/catalog/catalog-filter-skeleton";
import { getCategories } from "@/lib/data";
import { getFirst, parseFilters, toGetProductsParams } from "@/lib/catalog-filters";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";
import Breadcrumbs, {
  type BreadcrumbItem,
} from "@/components/catalog/breadcrumbs";
import CategoryIntroduction from "@/components/header/category-introduction";

const ITEMS_PER_PAGE = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [tProducts, tCommon, tCategories] = await Promise.all([
    getTranslations("products"),
    getTranslations("common"),
    getTranslations("categories"),
  ]);

  // The navbar and filter panel write ?group=, ?category=<slug>, ?brand=,
  // ?minPrice=, etc. parseFilters reads them into a typed object and
  // toGetProductsParams turns that into getProducts parameters (resolving
  // category slugs to ids via the loaded categories).
  const filters = parseFilters(params);
  // Categories are cached (unstable_cache) and feed the filter panel's
  // category list; the facets (brands + price bounds) are fetched by the
  // filter panel and sheet components themselves, behind their own Suspense
  // boundaries, so this page does not suspend on that query.
  const categories = await getCategories();
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

  // Breadcrumb trail reflects the active filters. "Start" goes to the landing
  // page, "Catalog" clears all filters, and the group level links to its
  // filtered view. Category, search and sale segments are terminal (plain
  // text); only the very last segment gets aria-current="page" (handled by
  // the Breadcrumbs component). Unknown slugs fall back to "All products".
  // A selection spanning several categories has no single group or category
  // level: the trail ends in a generic results label instead.
  const matchedCategories = filters.categories
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[number] => c !== undefined);
  const isMultiCategory = matchedCategories.length > 1;
  const matchedCategory = isMultiCategory ? undefined : matchedCategories[0];
  const explicitGroup = NAV_GROUPS.find((g) => g.slug === filters.group);
  const inferredGroup =
    !isMultiCategory && filters.categories[0]
      ? NAV_GROUPS.find((g) =>
          g.categorySlugs.includes(filters.categories[0]),
        )
      : undefined;
  const activeGroup = isMultiCategory ? undefined : explicitGroup ?? inferredGroup;
  // Group titles live in the message catalogs (same keys as the intro
  // header and the landing page's FeaturedGrid); NAV_GROUPS is the fallback.
  const groupTitle = (group: (typeof NAV_GROUPS)[number]): string => {
    const key = GROUP_MESSAGE_KEYS[group.slug];
    return key ? tCategories(key) : group.title;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tProducts("start"), href: "/" },
    { label: tProducts("catalog"), href: "/products" },
  ];
  // Terminal (non-link) segments after the group level, in display order.
  const terminalLabels: string[] = [];
  if (isMultiCategory) {
    // The selection spans several groups, so there is no single group or
    // category level to show; the trail ends in a generic results label.
    terminalLabels.push(
      searchQuery
        ? tProducts("searchResults", { query: searchQuery })
        : tProducts("resultsLabel"),
    );
  } else {
    if (activeGroup && matchedCategory) {
      breadcrumbItems.push({
        label: groupTitle(activeGroup),
        href: `/products?group=${encodeURIComponent(activeGroup.slug)}`,
      });
      terminalLabels.push(matchedCategory.name);
    } else if (!activeGroup && matchedCategory) {
      // Category outside every nav group: skip the group level.
      terminalLabels.push(matchedCategory.name);
    }
    if (searchQuery) {
      terminalLabels.push(tProducts("searchResults", { query: searchQuery }));
    }
    if (activeGroup && !matchedCategory) {
      if (terminalLabels.length > 0) {
        breadcrumbItems.push({
          label: groupTitle(activeGroup),
          href: `/products?group=${encodeURIComponent(activeGroup.slug)}`,
        });
      } else {
        // Group alone is the current page.
        breadcrumbItems.push({ label: groupTitle(activeGroup) });
      }
    }
  }
  if (filters.sale) {
    terminalLabels.push(tProducts("sale"));
  }
  for (const label of terminalLabels) {
    breadcrumbItems.push({ label });
  }
  if (breadcrumbItems.length === 2) {
    breadcrumbItems.push({ label: tProducts("allProducts") });
  }

  // The intro header follows the selection (T100, issue #149 / #200): the
  // active nav group's title, description and image — the same group the
  // breadcrumb trail uses (resolved from ?group= or inferred from
  // ?category=), so header and breadcrumb always agree. A single category
  // shows its parent group's intro; the category itself stays in the
  // breadcrumb trail, and only a category outside every nav group falls back
  // to its own row. Otherwise the catalogue defaults. Group
  // titles/descriptions and the catalogue defaults are resolved from the
  // message catalogs inside the component. A selection spanning several
  // categories shows the generic "products found" intro (multiCategory)
  // instead.
  return (
    <main id="main-content" className="flex flex-col justify-center items-stretch bg-bg-page pb-10 min-w-0 overflow-x-clip">
      <CategoryIntroduction
        category={
          matchedCategory
            ? {
                name: matchedCategory.name,
                description: matchedCategory.description,
                image: matchedCategory.image,
              }
            : undefined
        }
        groupSlug={activeGroup?.slug}
        multiCategory={isMultiCategory}
      />
      <div className="catalog-gutter">
        <div className="catalog-column">
          <Breadcrumbs items={breadcrumbItems} ariaLabel={tCommon("breadcrumbs")} />

          <div className="catalog-toolbar">
            <div className="flex min-w-0 flex-row flex-wrap items-center gap-3">
              <Suspense fallback={<CatalogFilterChipSkeleton />}>
                <CatalogFilterSheetData
                  categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
                />
              </Suspense>
              <button
                type="button"
                className="inline-flex min-h-11 flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-text-primary"
              >
                {tProducts("mostPopular")}
              </button>
            </div>
          </div>

          <div className="catalog-layout">
            <div className="catalog-sidebar">
              <Suspense fallback={<CatalogFilterSkeleton />}>
                <CatalogFilterPanel
                  categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
                />
              </Suspense>
            </div>
            <Suspense fallback={<CatalogGridSkeleton />}>
              <CatalogGrid
                filterParams={filterParams}
                page={requestedPage}
                limit={ITEMS_PER_PAGE}
                params={params}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
