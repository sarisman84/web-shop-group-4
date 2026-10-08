import { Link } from "@/i18n/routing";
import { getReviews } from "@/lib/data/reviews";

function StarRating({ rating, size = "text-lg" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} av 5 stjärnor`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`${size} ${i < rating ? "text-black" : "text-gray-300"}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function Review() {
  const reviews = await getReviews();

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const totalReviews = reviews.length;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-label="Kundomdömen">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Vad våra kunder säger
        </h2>
        <Link
          href="/reviews"
          className="text-sm font-medium text-black hover:no-underline underline"
        >
          Visa fler omdömen →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Average rating card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
          <div className="mt-2">
            <StarRating rating={Math.round(Number(averageRating))} size="text-2xl" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Baserat på {totalReviews} omdömen
          </p>
        </div>

        {/* Review cards */}
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col"
          >
            <StarRating rating={review.rating} />
            <h3 className="mt-3 font-semibold text-gray-900">
              {review.comment.split(" ").slice(0, 3).join(" ")}
            </h3>
            <p className="mt-1 text-sm text-gray-600 flex-1">
              {review.comment}
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                {review.reviewer_name}
              </p>
              <p className="text-xs text-gray-500">Verifierad köpare</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
