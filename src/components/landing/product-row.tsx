import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/catalog/product-card";
import { createClient } from "@/lib/supabase/server";
import { readWishlist } from "@/lib/wishlist-cookie";
import type { Product } from "@/types/product";

const PRODUCTS_PER_ROW = 3;

/** Column a row is ranked by, so the products match the heading above them. */
export type RowSort = "discount_percentage" | "rating";

export interface ProductRowProps {
  title: string;
  sort: RowSort;
  /** Products already shown by earlier rows, so two rows never repeat. */
  offset?: number;
}

type EmbeddedCategory = { name: string };

type ProductCardRow = {
  id: number;
  title: string;
  price: number;
  thumbnail: string | null;
  discount_percentage: number | null;
  category: EmbeddedCategory | EmbeddedCategory[] | null;
  reviews: { rating: number }[] | null;
};

// PostgREST returns an embedded to-one relation as an object, but the client
// types it as an array because the foreign key is not declared as unique.
function getCategoryName(category: ProductCardRow["category"]): string {
  if (!category) return "";

  return Array.isArray(category)
    ? (category[0]?.name ?? "")
    : category.name;
}

function toCardProduct(row: ProductCardRow): Product {
  const reviews = row.reviews ?? [];
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    id: row.id,
    name: row.title,
    category: getCategoryName(row.category),
    price: row.price,
    currency: "SEK",
    image: row.thumbnail ?? "",
    review_count: reviews.length,
    review_sum:
      reviews.length > 0
        ? Math.round((total / reviews.length) * 10) / 10
        : 0,
    discountPercentage: row.discount_percentage,
  };
}

async function getRowProducts(
  sort: RowSort,
  offset: number,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, title, price, thumbnail, discount_percentage, category:categories(name), reviews(rating)",
    )
    // nullsFirst:false keeps undiscounted/unrated products out of the top slots,
    // and the id tie-breaker keeps rows stable when many products share a value.
    .order(sort, { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .range(offset, offset + PRODUCTS_PER_ROW - 1);

  if (error) {
    console.error("Error fetching landing page products:", error);
    return [];
  }

  return ((data ?? []) as ProductCardRow[]).map(toCardProduct);
}

export default async function ProductRow({
  title,
  sort,
  offset = 0,
}: ProductRowProps) {
  const products = await getRowProducts(sort, offset);

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