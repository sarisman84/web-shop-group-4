import { Skeleton } from "@/components/ui/skeleton";

const PULSE = "motion-safe:animate-pulse";

// Fallback for the desktop filter sidebar's Suspense boundary. Mirrors the
// panel's shape (a bordered card with a header and a few stacked rows) so the
// swap from skeleton to panel does not jump. Shown while the catalogue facets
// (brands + price bounds) resolve.
export function CatalogFilterSkeleton() {
  return (
    <div
      className="w-full rounded-xl border border-gray-200 bg-white p-4"
      aria-busy="true"
      aria-hidden="true"
    >
      <Skeleton className={`h-4 w-24 ${PULSE}`} />
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className={`h-10 w-full rounded-lg ${PULSE}`} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className={`h-3.5 w-3/4 ${PULSE}`} />
        ))}
      </div>
    </div>
  );
}

// Fallback for the mobile "Filter (N)" chip's Suspense boundary. A chip-shaped
// placeholder matching the chip's height so the toolbar does not jump.
export function CatalogFilterChipSkeleton() {
  return (
    <Skeleton
      className={`h-11 w-28 rounded-lg ${PULSE}`}
      aria-busy="true"
      aria-hidden="true"
    />
  );
}
