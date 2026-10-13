import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const PULSE = "motion-safe:animate-pulse";

// Instant fallback for every shop route. It is prefetched with the page that
// links to it, so a click shows this skeleton immediately (the shared header
// and footer stay interactive) while the real page streams in and swaps it
// out. Kept generic on purpose: it stands in for the landing page, the
// catalogue, the cart and every other segment under [locale].
export default function ShopLoading() {
  const t = useTranslations("common");

  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("loading")}</span>

      {/* Intro / hero band */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-10">
        <Skeleton className={`h-8 w-64 max-w-full ${PULSE}`} />
        <Skeleton className={`mt-4 h-4 w-96 max-w-full ${PULSE}`} />
      </div>

      {/* Product grid */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200">
            <Skeleton className={`aspect-[4/3] w-full rounded-none ${PULSE}`} />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className={`h-4 w-3/4 ${PULSE}`} />
              <Skeleton className={`h-4 w-1/3 ${PULSE}`} />
              <Skeleton className={`mt-2 h-9 w-28 rounded-lg ${PULSE}`} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
