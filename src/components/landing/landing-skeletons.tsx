import { Skeleton } from "@/components/ui/skeleton";

const PULSE = "motion-safe:animate-pulse";

// Streaming fallbacks for the landing page's Suspense boundaries. They mirror
// the section layouts (promo collage, product rows, customer service, reviews)
// closely enough that the swap from skeleton to content does not jump.

function PromoSkeleton({ imageSide }: { imageSide: "left" | "right" }) {
  const collage = (
    <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className={`aspect-square w-full rounded-none ${PULSE}`} />
      ))}
    </div>
  );

  const copy = (
    <div className={imageSide === "right" ? "lg:pr-8" : "lg:pl-8"}>
      <Skeleton className={`h-3 w-24 ${PULSE}`} />
      <Skeleton className={`mt-4 h-9 w-4/5 ${PULSE}`} />
      <Skeleton className={`mt-4 h-4 w-full max-w-md ${PULSE}`} />
      <Skeleton className={`mt-4 h-4 w-3/4 max-w-md ${PULSE}`} />
      <Skeleton className={`mt-8 h-11 w-36 rounded-full ${PULSE}`} />
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-hidden="true">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {imageSide === "left" && collage}
        {copy}
        {imageSide === "right" && collage}
      </div>
    </section>
  );
}

function ProductRowSkeleton() {
  return (
    <section className="pb-16" aria-hidden="true">
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-4 pb-6">
        <Skeleton className={`h-7 w-56 max-w-full ${PULSE}`} />
        <Skeleton className={`h-5 w-32 ${PULSE}`} />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200">
            <Skeleton className={`aspect-[4/3] w-full rounded-none ${PULSE}`} />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className={`h-4 w-1/3 ${PULSE}`} />
              <Skeleton className={`h-4 w-3/4 ${PULSE}`} />
              <Skeleton className={`mt-2 h-9 w-28 rounded-lg ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KundserviceSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-hidden="true">
      <Skeleton className={`h-7 w-64 max-w-full ${PULSE}`} />
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col items-start gap-3">
            <Skeleton className={`h-10 w-10 rounded-full ${PULSE}`} />
            <Skeleton className={`h-5 w-28 ${PULSE}`} />
            <Skeleton className={`h-4 w-full ${PULSE}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Fallback for the whole product block (promo, rows, customer service, promo). */
export function LandingSectionsSkeleton() {
  return (
    <>
      <PromoSkeleton imageSide="right" />
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <ProductRowSkeleton />
        <KundserviceSkeleton />
        <ProductRowSkeleton />
      </div>
      <PromoSkeleton imageSide="left" />
    </>
  );
}

/** Fallback for the reviews band (average card + three review cards). */
export function ReviewSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-hidden="true">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className={`h-7 w-56 max-w-full ${PULSE}`} />
        <Skeleton className={`h-5 w-24 ${PULSE}`} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 p-6">
          <Skeleton className={`h-12 w-24 ${PULSE}`} />
          <Skeleton className={`h-6 w-32 ${PULSE}`} />
          <Skeleton className={`h-4 w-28 ${PULSE}`} />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-6">
            <Skeleton className={`h-5 w-24 ${PULSE}`} />
            <Skeleton className={`h-5 w-3/4 ${PULSE}`} />
            <Skeleton className={`h-4 w-full ${PULSE}`} />
            <Skeleton className={`h-4 w-2/3 ${PULSE}`} />
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <Skeleton className={`h-4 w-32 ${PULSE}`} />
              <Skeleton className={`h-3 w-24 ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
