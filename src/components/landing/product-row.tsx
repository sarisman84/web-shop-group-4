import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/catalog/product-card";
import { getProducts, type ProductSort } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import type { Product } from "@/types/product";

const PRODUCTS_PER_ROW = 3;

/** Column a row is ranked by, so the products match the heading above them. */
export type RowSort = Exclude<ProductSort, "newest">;

export interface LandingRowParams {
  sort: RowSort;
  /** Products already placed on the page, so this row does not repeat them. */
  excludeIds?: number[];
}

export interface ProductRowProps {
  title: string;
  /** Fetched by the page with {@link getLandingRowProducts}, so the page can
   * pass the same ids on to the promo sections and keep every product on the
   * landing page unique. */
  products: Product[];
}

// PostgREST returns an embedded to-one relation as an object, but the client
// types it as an array because the foreign key is not declared as unique.
function getCategoryName(category: unknown): string {
  if (!category) return "";

  return Array.isArray(category)
    ? ((category[0] as { name?: string } | undefined)?.name ?? "")
    : ((category as { name?: string }).name ?? "");
}

function toCardProduct(product: Awaited<ReturnType<typeof getProducts>>["products"][number]): Product {
  const reviews = product.reviews ?? [];
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    id: product.id,
    name: product.title,
    category: getCategoryName(product.category),
    price: product.price,
    currency: "SEK",
    image: product.thumbnail,
    review_count: reviews.length,
    review_sum:
      reviews.length > 0
        ? Math.round((total / reviews.length) * 10) / 10
        : 0,
    discountPercentage: product.discountPercentage,
  };
}

/**
 * The three products for one landing page row, ranked by `sort` and skipping
 * anything in `excludeIds`. Lives here rather than in the component so the page
 * can fetch every row up front and hand the ids to the promo sections.
 */
export async function getLandingRowProducts({
  sort,
  excludeIds,
}: LandingRowParams): Promise<Product[]> {
  const { products } = await getProducts({
    limit: PRODUCTS_PER_ROW,
    sort,
    excludeIds,
  });

  return products.map(toCardProduct);
}

export default async function ProductRow({
  title,
  products,
}: ProductRowProps) {
  if (products.length === 0) return null;

  const wishlist = await readWishlist();

  return (
    <section aria-label={title} className="pb-16">
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-4 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h2>

        <Link
          href="/products"
          className="inline-flex flex-row items-center gap-1 text-sm font-medium underline underline-offset-4 hover:no-underline"
        >
          <span className="sm:hidden">Se alla</span>
          <span className="hidden sm:inline">Se våra erbjudanden</span>
          <ArrowRight size="1rem" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              data={product}
              wishlisted={wishlist.includes(product.id)}
              headingLevel="h3"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}