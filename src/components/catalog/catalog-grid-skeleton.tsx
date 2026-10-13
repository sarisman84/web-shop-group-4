import { Skeleton } from "@/components/ui/skeleton";

const PULSE = "motion-safe:animate-pulse";

// Fallback for the catalogue grid's Suspense boundary. Mirrors the grid's
// layout (the "N products found" line plus a page of product cards) so the
// swap from skeleton to content does not jump. Shown while getProducts
// resolves on a filter change; the filter panel and toolbar stay interactive.
export function CatalogGridSkeleton() {
  return (
    <div className="min-w-0 flex-1" aria-busy="true" aria-hidden="true">
      <div className="mb-3">
        <Skeleton className={`h-4 w-40 ${PULSE}`} />
      </div>
      <div className="catalog-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <Skeleton className={`aspect-[4/3] w-full rounded-none ${PULSE}`} />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className={`h-4 w-1/3 ${PULSE}`} />
              <Skeleton className={`h-4 w-3/4 ${PULSE}`} />
              <Skeleton className={`mt-2 h-9 w-28 rounded-lg ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
