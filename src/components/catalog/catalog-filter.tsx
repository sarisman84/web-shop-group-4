"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// How long to wait after the last price change before the catalogue is
// re-fetched, so dragging the slider fires one navigation instead of one per
// pixel of drag.
const PRICE_DEBOUNCE_MS = 300;

// The filter values this panel controls. The rest of the query (group, sort,
// search, ...) is owned by other UI (header menu, sort control, search bar)
// and is carried over untouched.
interface FilterState {
  categories: string[];
  brands: string[];
  inStock: boolean;
  sale: boolean;
  priceMin: number;
  priceMax: number;
  minRating: number | null;
}

// Keeps the filter panel in sync with the URL, but optimistically: every
// control updates its own state the moment it is touched and pushes the
// navigation in the background. Without this, each control's state was read
// straight from the URL, so it only changed once the server round trip
// finished — the panel felt frozen for the whole fetch. A category selection
// is the latest filter and overrides the active `?group=` (the group's link
// is what set it); the other params (search, brand, price, ...) are kept.
interface CatalogFilterProps {
  categories: FilterCategory[];
  brands: FilterBrand[];
  priceBounds: PriceBounds;
  /**
   * Reports the number of active filters whenever the optimistic state
   * changes, so a parent (the mobile sheet's "Filter (N)" chip) can update
   * instantly instead of waiting for the URL round trip.
   */
  onActiveCountChange?: (count: number) => void;
}

export default function CatalogFilter({
  categories,
  brands,
  priceBounds,
  onActiveCountChange,
}: CatalogFilterProps) {
  const router = useRouter();
  const tCategories = useTranslations("categories");
  const searchParams = useSearchParams();
  const urlFilters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlFilters.categories,
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    urlFilters.brands,
  );
  const [inStockOnly, setInStockOnly] = useState(urlFilters.inStock);
  const [onSale, setOnSale] = useState(urlFilters.sale);
  const [priceMin, setPriceMin] = useState(
    urlFilters.minPrice ?? priceBounds.min,
  );
  const [priceMax, setPriceMax] = useState(
    urlFilters.maxPrice ?? priceBounds.max,
  );
  const [minRating, setMinRating] = useState<number | null>(
    urlFilters.minRating ?? null,
  );

  // Number of active filters, derived from the optimistic state so a parent
  // (the mobile sheet's "Filter (N)" chip) can update the moment a control is
  // touched. Mirrors the URL-derived count the sheet used to compute.
  const activeCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceMin > priceBounds.min || priceMax < priceBounds.max ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSale ? 1 : 0);

  useEffect(() => {
    onActiveCountChange?.(activeCount);
  }, [activeCount, onActiveCountChange]);

  // The query string of the last navigation this panel pushed, so the sync
  // effect below can tell its own navigations apart from external URL changes
  // (back/forward, the header's category menu, the search bar).
  const lastPushedRef = useRef<string | null>(null);

  // Builds the catalogue query from the optimistic state. Non-filter params
  // are carried over from the current URL; the filter params are rewritten
  // from state so rapid successive changes compose instead of clobbering
  // each other (the URL may still reflect an in-flight navigation).
  const buildQuery = useCallback(
    (state: FilterState, clearGroup: boolean) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("page");
      next.delete("category");
      next.delete("brand");
      next.delete("inStock");
      next.delete("sale");
      next.delete("minPrice");
      next.delete("maxPrice");
      next.delete("minRating");
      if (clearGroup) next.delete("group");
      if (state.categories.length) next.set("category", state.categories.join(","));
      if (state.brands.length) next.set("brand", state.brands.join(","));
      if (state.inStock) next.set("inStock", "true");
      if (state.sale) next.set("sale", "true");
      if (state.priceMin > priceBounds.min) next.set("minPrice", String(state.priceMin));
      if (state.priceMax < priceBounds.max) next.set("maxPrice", String(state.priceMax));
      if (state.minRating !== null) next.set("minRating", String(state.minRating));
      return next.toString();
    },
    [searchParams, priceBounds],
  );

  const push = useCallback(
    (query: string) => {
      lastPushedRef.current = query;
      router.push(query ? `/products?${query}` : "/products", { scroll: false });
    },
    [router],
  );

  // Sync the optimistic state from the URL when it changes for a reason other
  // than this panel's own navigation (back/forward, header, search).
  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (lastPushedRef.current === currentQuery) {
      lastPushedRef.current = null;
      return;
    }
    setSelectedCategories(urlFilters.categories);
    setSelectedBrands(urlFilters.brands);
    setInStockOnly(urlFilters.inStock);
    setOnSale(urlFilters.sale);
    setPriceMin(urlFilters.minPrice ?? priceBounds.min);
    setPriceMax(urlFilters.maxPrice ?? priceBounds.max);
    setMinRating(urlFilters.minRating ?? null);
  }, [searchParams, urlFilters, priceBounds]);

  // Price changes are debounced: the slider fires on every drag tick, so
  // pushing a navigation per tick would pile up round trips.
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    },
    [],
  );

  const commit = useCallback(
    (state: FilterState, clearGroup = false) => {
      push(buildQuery(state, clearGroup));
    },
    [buildQuery, push],
  );

  function handleCategoriesChange(slugs: string[]) {
    setSelectedCategories(slugs);
    commit(
      {
        categories: slugs,
        brands: selectedBrands,
        inStock: inStockOnly,
        sale: onSale,
        priceMin,
        priceMax,
        minRating,
      },
      true,
    );
  }

  function handleBrandsChange(next: string[]) {
    setSelectedBrands(next);
    commit({
      categories: selectedCategories,
      brands: next,
      inStock: inStockOnly,
      sale: onSale,
      priceMin,
      priceMax,
      minRating,
    });
  }

  function handleInStockChange(value: boolean) {
    setInStockOnly(value);
    commit({
      categories: selectedCategories,
      brands: selectedBrands,
      inStock: value,
      sale: onSale,
      priceMin,
      priceMax,
      minRating,
    });
  }

  function handleSaleChange(value: boolean) {
    setOnSale(value);
    commit({
      categories: selectedCategories,
      brands: selectedBrands,
      inStock: inStockOnly,
      sale: value,
      priceMin,
      priceMax,
      minRating,
    });
  }

  function handlePriceChange(min: number, max: number) {
    setPriceMin(min);
    setPriceMax(max);
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    priceTimerRef.current = setTimeout(() => {
      commit({
        categories: selectedCategories,
        brands: selectedBrands,
        inStock: inStockOnly,
        sale: onSale,
        priceMin: min,
        priceMax: max,
        minRating,
      });
    }, PRICE_DEBOUNCE_MS);
  }

  function handleMinRatingChange(rating: number | null) {
    setMinRating(rating);
    commit({
      categories: selectedCategories,
      brands: selectedBrands,
      inStock: inStockOnly,
      sale: onSale,
      priceMin,
      priceMax,
      minRating: rating,
    });
  }

  function handleReset() {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setOnSale(false);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
    setMinRating(null);
    if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
    push("");
  }

  return (
    <FilterPanel
      groups={NAV_GROUPS.map((g) => ({
        title: GROUP_MESSAGE_KEYS[g.slug] ? tCategories(GROUP_MESSAGE_KEYS[g.slug]) : g.title,
        categorySlugs: [...g.categorySlugs],
      }))}
      categories={categories}
      brands={brands}
      selectedCategorySlugs={selectedCategories}
      onCategoriesChange={handleCategoriesChange}
      selectedBrands={selectedBrands}
      onBrandsChange={handleBrandsChange}
      inStockOnly={inStockOnly}
      onInStockOnlyChange={handleInStockChange}
      onSale={onSale}
      onOnSaleChange={handleSaleChange}
      priceBounds={priceBounds}
      priceMin={priceMin}
      priceMax={priceMax}
      onPriceChange={handlePriceChange}
      minRating={minRating}
      onMinRatingChange={handleMinRatingChange}
      onReset={handleReset}
    />
  );
}
