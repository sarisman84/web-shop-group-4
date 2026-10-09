import { Product } from "@/types/product";
import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import WishlistButton from "@/components/catalog/wishlist-button";
import { formatMoney } from "@/lib/format";

export interface ProductCardProps {
  data: Product;
  wishlisted?: boolean;
  // Cards sit under an h2 on the landing page but at the top level in the
  // catalogue, so the heading level has to be caller-controlled.
  headingLevel?: "h2" | "h3" | "h4";
  // Media height per the design spec (DESIGN-desktop.md §4.9): 260 px on the
  // landing page, ~328 px on the category page. A fixed height keeps every
  // card the same size regardless of the product image's aspect ratio.
  mediaHeight?: "landing" | "catalogue";
  // Set for cards above the fold so their image is the LCP candidate and
  // loads eagerly instead of waiting for the lazy-loading default.
  eager?: boolean;
}

/**
 * Rounds a stored discount to the whole percentage shown in the UI, returning
 * null when there is nothing meaningful to show. Exported so the landing page
 * promo can render its badge and its "up to N%" headline from the same rule —
 * a headline that disagrees with the badge next to it is a false claim.
 */
export function getDiscountPercentage(
  discountPercentage?: number | null,
): number | null {
  if (typeof discountPercentage !== "number" || !Number.isFinite(discountPercentage)) {
    return null;
  }

  const rounded = Math.round(discountPercentage);
  return rounded > 0 && rounded < 100 ? rounded : null;
}

// `price` is the undiscounted amount, so the price to charge is derived from
// the discount percentage and the stored price becomes the struck-through one.
function getDiscountedPrice(
  price: number,
  discountPercentage: number | null,
): number {
  if (discountPercentage === null) return price;

  // Whole kronor, since öre is not used in cash and a fractional price reads
  // as a bug (20% off 999 shows 799, not 799.20). Rounded here at the display
  // boundary only, so the cart and order lines keep the exact figure.
  return Math.round(price * (1 - discountPercentage / 100));
}

export default function ProductCard({
  data: product,
  wishlisted = false,
  headingLevel: Heading = "h2",
  mediaHeight = "landing",
  eager = false,
}: ProductCardProps) {
  const t = useTranslations("products");
  const discount = getDiscountPercentage(product.discountPercentage);
  const mediaClass =
    mediaHeight === "catalogue" ? "h-card-media-catalogue" : "h-card-media-landing";

  return (
    <article className="card-surface flex h-full flex-col overflow-hidden border border-[#DDDDDD]">
      <div className={`relative card-thumbnail shrink-0 ${mediaClass}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="card-thumbnail-img"
          unoptimized
          loading={eager ? "eager" : undefined}
        />

        {discount !== null && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}

        <span className="absolute top-2 right-2">
          <WishlistButton
            productId={product.id}
            productName={product.name}
            wishlisted={wishlisted}
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col bg-white">
        <div className="flex flex-row gap-5 px-4 pt-4 justify-between font-bold">
          <Heading className="line-clamp-2 min-w-0">{product.name}</Heading>
          <span className="flex shrink-0 flex-row justify-center items-center gap-1">
            <Star size={"1rem"} fill="black" stroke="black" aria-hidden="true" />
            {product.review_sum}
            <span className="sr-only"> {t("outOfFive")}</span>
          </span>
        </div>

        <div className="flex flex-row justify-between leading-4 px-4 pb-8 text-sm text-card-muted text-left">
          <span>{product.category}</span>
          <span>{product.review_count} {t("reviews")}</span>
        </div>

        <div className="mt-auto flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 p-4">
          <Price
            value={getDiscountedPrice(product.price, discount)}
            oldValue={discount !== null ? product.price : undefined}
            currency={product.currency}
          />
          <AddToCartButton label={t("buy")} id={product.id} />
        </div>
      </div>
    </article>
  );
}

interface PriceProps {
  value: number;
  oldValue?: number;
  currency: string;
}

function Price({ value, oldValue, currency }: PriceProps) {
  const t = useTranslations("products");
  return (
    <span className="flex min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex flex-row items-center gap-1 whitespace-nowrap">
        <Amount value={value} currency={currency} />
      </span>
      {oldValue && (
        <span className="flex flex-row items-center gap-1 price-old whitespace-nowrap">
          <span className="sr-only">{t("oldPrice")} </span>
          <Amount value={oldValue} currency={currency} />
        </span>
      )}
    </span>
  );
}

interface AmountProps {
  value: number;
  currency: string;
}

function Amount({ value, currency }: AmountProps) {
  const locale = useLocale();
  return <>{formatMoney(value, locale, currency)}</>;
}

interface AddToCartButtonProps {
  label: string;
  id: number;
}

function AddToCartButton({ label, id }: AddToCartButtonProps) {
  return (
    <Link
      href={`/products/${id}`}
      type="button"
      className="cta-button"
    >
      <ShoppingCart size={16} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
