import { getReviews } from "@/lib/data/reviews";
import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const REVIEWS_PER_PAGE = 50;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} av 5 stjärnor`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-foreground" : "text-muted-foreground/30"}`}
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
  
  // Filter to include 4-star and above reviews
  const reviews = allReviews.filter((r) => r.rating >= 4);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Kundomdömen
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Baserat på {reviews.length} omdömen • Snittbetyg: {averageRating}
            </p>
          </div>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            ← Tillbaka till butiken
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReviews.map((review) => (
            <Card key={review.id} className="flex flex-col justify-between">
              <CardContent className="p-6 flex flex-col flex-1">
                <StarRating rating={review.rating} />
                <p className="mt-3 text-sm text-muted-foreground flex-1">
                  {review.comment}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {review.reviewer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Verifierad köpare</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Sidnumrering">
            {currentPage > 1 && (
              <Link
                href={`/reviews?page=${currentPage - 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                ← Föregående
              </Link>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/reviews?page=${page}`}
                className={buttonVariants({
                  variant: page === currentPage ? "default" : "outline",
                  size: "sm",
                })}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={`/reviews?page=${currentPage + 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
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