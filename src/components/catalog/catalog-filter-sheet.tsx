"use client";

import { useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import CatalogFilter from "@/components/catalog/catalog-filter";
import type {
  FilterBrand,
  FilterCategory,
  PriceBounds,
} from "@/components/catalog/filter-panel";
import { parseFilters } from "@/lib/catalog-filters";

// ---------------------------------------------------------------------------
// CatalogFilterSheet — the "Filter (N)" chip shown below desktop widths.
//
// Opens the same URL-driven CatalogFilter used by the desktop sidebar inside
// a bottom sheet (mobile) / drawer (tablet), so every selection keeps writing
// ?category=, ?brand=, ?minPrice=, etc. through the shared FilterPanel logic.
// Hidden on lg+ where the sidebar takes over (see `catalog-sidebar`).
// ---------------------------------------------------------------------------

interface CatalogFilterSheetProps {
  categories: FilterCategory[];
  brands: FilterBrand[];
  priceBounds: PriceBounds;
}

export default function CatalogFilterSheet({
  categories,
  brands,
  priceBounds,
}: CatalogFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);

  const activeCount =
    filters.categories.length +
    filters.brands.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.sale ? 1 : 0);
  const label = activeCount > 0 ? `Filter (${activeCount})` : "Filter";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open ]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="catalog-filter-chip lg:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute flex flex-col bg-white shadow-xl max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[85vh] max-sm:rounded-t-2xl sm:inset-y-0 sm:left-0 sm:w-[320px] sm:rounded-r-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <span id={titleId} className="text-sm font-semibold text-gray-900">
                {label}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Stäng filter"
                autoFocus
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <CatalogFilter
                categories={categories}
                brands={brands}
                priceBounds={priceBounds}
              />
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Visa resultat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
