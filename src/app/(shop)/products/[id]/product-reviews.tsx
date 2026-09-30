import type { Product } from "@/app/(admin)/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StarRating from "@/components/shop/star-rating";
import ReviewSummary from "./review-summary";

function formatReviewDate(date?: string): string {
  if (!date) return "Unknown date";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(parsed);
}

export default function ProductReviews({ product }: { product: Product }) {
  const reviews = product.reviews ?? [];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Customer reviews</CardTitle>
        <CardDescription>
          {reviews.length === 0
            ? "No reviews yet"
            : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <ReviewSummary reviews={reviews} averageRating={product.rating} />

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This product has no customer reviews yet. Your feedback would be
            the first.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reviews.map((review, index) => (
              <li
                key={`${review.reviewerEmail}-${review.date}-${index}`}
                className="flex flex-col gap-2 py-5 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{review.reviewerName}</h3>
                    <StarRating
                      rating={review.rating}
                      className="text-sm"
                    />
                  </div>
                  <time
                    dateTime={review.date}
                    className="text-xs text-muted-foreground"
                  >
                    {formatReviewDate(review.date)}
                  </time>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-foreground/80">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
