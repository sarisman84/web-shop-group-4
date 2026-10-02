import StarRating from "@/components/shop/star-rating";
import { cn } from "@/lib/utils";

const MAX_RATING = 5;

interface RatingReview {
  rating: number;
}

interface DistributionRow {
  rating: number;
  count: number;
  percentage: number;
}

function buildDistribution(
  reviews: readonly RatingReview[],
): DistributionRow[] {
  const counts = new Array<number>(MAX_RATING + 1).fill(0);

  for (const review of reviews) {
    const value = Math.round(review.rating);
    if (value >= 1 && value <= MAX_RATING) {
      counts[value] += 1;
    }
  }

  const total = reviews.length;

  return Array.from({ length: MAX_RATING }, (_, index) => MAX_RATING - index).map(
    (rating) => ({
      rating,
      count: counts[rating],
      percentage: total > 0 ? (counts[rating] / total) * 100 : 0,
    }),
  );
}

function averageOf(reviews: readonly RatingReview[]): number {
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

export default function ReviewSummary({
  reviews,
  averageRating,
}: {
  reviews: readonly RatingReview[];
  averageRating?: number;
}) {
  const distribution = buildDistribution(reviews);
  const hasWrittenReviews = reviews.length > 0;
  const average = hasWrittenReviews ? averageOf(reviews) : (averageRating ?? 0);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32">
        <span className="text-4xl font-semibold tabular-nums tracking-tight">
          {average.toFixed(1)}
        </span>
        <StarRating rating={average} />
        <span className="mt-1 text-center text-xs text-muted-foreground">
          {hasWrittenReviews
            ? `Based on ${reviews.length} ${
                reviews.length === 1 ? "review" : "reviews"
              }`
            : "No written reviews yet"}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="sr-only">Rating distribution</h3>
        <ul className="flex flex-col gap-2">
          {distribution.map((row) => (
            <li key={row.rating} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">
                {row.rating} {row.rating === 1 ? "star" : "stars"}
              </span>

              <span
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className={cn(
                    "block h-full rounded-full bg-amber-600 dark:bg-amber-400",
                    row.percentage === 0 && "bg-transparent",
                  )}
                  style={{ width: `${row.percentage}%` }}
                />
              </span>

              <span className="w-24 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
                {row.count} ({Math.round(row.percentage)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
