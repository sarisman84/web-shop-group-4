"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import FilterPanel, {
  type FilterBrand,
  type FilterCategory,
  type PriceBounds,
} from "@/components/catalog/filter-panel";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";
import { parseFilters } from "@/lib/catalog-filters";
import { useRouter } from "@/i18n/routing";

// Keeps the filter panel in sync with the URL: every change rewrites the
// search params and resets to page 1. `group` is kept so a navbar link stays
// active while the visitor refines it.
interface CatalogFilterProps {
  categories: FilterCategory[];
  brands: FilterBrand[];
  priceBounds: PriceBounds;
}

export default function CatalogFilter({
  categories,
  brands,
  priceBounds,
}: CatalogFilterProps) {
  const router = useRouter();
  const tCategories = useTranslations("categories");
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);

  function update(changes: Record<string, string | string[] | null>) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");
    for (const [key, value] of Object.entries(changes)) {
      next.delete(key);
      if (Array.isArray(value)) {
        if (value.length) next.set(key, value.join(","));
      } else if (value !== null) {
        next.set(key, value);
      }
    }
    const query = next.toString();
    // scroll: false keeps the visitor where they are while the list updates.
    router.push(query ? `/products?${query}` : "/products", { scroll: false });
  }

  return (
    <FilterPanel
      groups={NAV_GROUPS.map((g) => ({
        title: GROUP_MESSAGE_KEYS[g.slug] ? tCategories(GROUP_MESSAGE_KEYS[g.slug]) : g.title,
        categorySlugs: [...g.categorySlugs],
      }))}
      categories={categories}
      brands={brands}
      selectedCategorySlugs={filters.categories}
      onCategoriesChange={(slugs) => update({ category: slugs })}
      selectedBrands={filters.brands}
      onBrandsChange={(selected) => update({ brand: selected })}
      inStockOnly={filters.inStock}
      onInStockOnlyChange={(v) => update({ inStock: v ? "true" : null })}
      onSale={filters.sale}
      onOnSaleChange={(v) => update({ sale: v ? "true" : null })}
      priceBounds={priceBounds}
      priceMin={filters.minPrice ?? priceBounds.min}
      priceMax={filters.maxPrice ?? priceBounds.max}
      onPriceChange={(min, max) =>
        update({
          minPrice: min > priceBounds.min ? String(min) : null,
          maxPrice: max < priceBounds.max ? String(max) : null,
        })
      }
      minRating={filters.minRating ?? null}
      onMinRatingChange={(r) => update({ minRating: r === null ? null : String(r) })}
      onReset={() => router.push("/products", { scroll: false })}
    />
  );
}
