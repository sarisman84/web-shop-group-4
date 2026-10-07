import { getReviews } from "@/lib/data/reviews";
import Link from "next/link";

const REVIEWS_PER_PAGE = 50;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} av 5 stjärnor`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-black" : "text-gray-300"}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const allReviews = await getReviews();
  
  // Filter to only include 3-star reviews
  const reviews = allReviews.filter((r) => r.rating >= 4);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              3-stjärniga omdömen
            </h1>
            <p className="mt-2 text-gray-500">
              Baserat på {reviews.length} omdömen • Snittbetyg: {averageRating}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            ← Tillbaka till butiken
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col"
            >
              <StarRating rating={review.rating} />
              <p className="mt-3 text-sm text-gray-600 flex-1">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Sidnumrering">
            {currentPage > 1 && (
              <Link
                href={`/reviews?page=${currentPage - 1}`}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                ← Föregående
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/reviews?page=${page}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-black text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/reviews?page=${currentPage + 1}`}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Nästa →
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}