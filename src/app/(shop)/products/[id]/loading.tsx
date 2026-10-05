import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PULSE = "motion-safe:animate-pulse";

export default function ProductLoading() {
  return (
    <main
      className="page-container flex flex-1 flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading product…</span>

      <Card>
        <CardContent className="grid gap-8 lg:grid-cols-2">
          <Skeleton className={`aspect-4/3 w-full rounded-xl sm:aspect-square ${PULSE}`} />

          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <Skeleton className={`h-5 w-24 rounded-4xl ${PULSE}`} />
              <Skeleton className={`h-5 w-20 rounded-4xl ${PULSE}`} />
            </div>
            <Skeleton className={`h-9 w-3/4 ${PULSE}`} />
            <Skeleton className={`h-4 w-32 ${PULSE}`} />
            <Skeleton className={`h-10 w-40 ${PULSE}`} />
            <Skeleton className={`h-8 w-full max-w-sm ${PULSE}`} />
            <Skeleton className={`h-12 w-full max-w-sm ${PULSE}`} />
          </div>
        </CardContent>
      </Card>

      <Skeleton className={`h-40 w-full rounded-xl ${PULSE}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className={`h-56 w-full rounded-xl ${PULSE}`} />
        <Skeleton className={`h-56 w-full rounded-xl ${PULSE}`} />
      </div>
    </main>
  );
}
