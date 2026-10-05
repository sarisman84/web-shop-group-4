import { Product } from "@/types/product";
import { DollarSign, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/catalog/wishlist-button";

export interface ProductCardProps {
  data: Product;
  wishlisted?: boolean;
  // Cards sit under an h2 on the landing page but at the top level in the
  // catalogue, so the heading level has to be caller-controlled.
  headingLevel?: "h2" | "h3" | "h4";
}

export default function ProductCard({
  data: product,
  wishlisted = false,
  headingLevel: Heading = "h2",
}: ProductCardProps) {
  const discount = getDiscountPercentage(product.discountPercentage);

  return (
    <article className="card-surface overflow-hidden border border-[#DDDDDD]">
      <div className="relative card-thumbnail">
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          className="card-thumbnail-img"
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

      <div className="bg-white">
        <div className="flex flex-row gap-5 px-4 pt-4 justify-between font-bold">
          <Heading className="line-clamp-2 min-w-0">{product.name}</Heading>
          <span className="flex shrink-0 flex-row justify-center items-center gap-1">
            <Star size={"1rem"} fill="black" stroke="black" aria-hidden="true" />
            {product.review_sum}
            <span className="sr-only"> out of 5 stars</span>
          </span>
        </div>

        <div className="flex flex-row justify-between leading-4 px-4 pb-8 text-sm text-card-muted text-left">
          <span>{product.category}</span>
          <span>{product.review_count} reviews</span>
        </div>

        <div className="flex flex-row justify-between p-4">
          <Price
            value={getDiscountedPrice(product.price, discount)}
            oldValue={discount !== null ? product.price : undefined}
            currency={product.currency}
          />
          <AddToCartButton label="Buy" id={product.id} />
        </div>
      </div>
    </article>
  );
}

function getDiscountPercentage(
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

  // Two decimals, since a percentage of an odd price lands on fractions of a
  // krona (e.g. 20% off 999 is 799.20).
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}

interface PriceProps {
  value: number;
  oldValue?: number;
  currency: string;
}

function Price({ value, oldValue, currency }: PriceProps) {
  return (
    <span className="flex flex-row gap-2">
      <span className="flex flex-row items-center gap-1">
        <Amount value={value} currency={currency} />
      </span>
      {oldValue && (
        <span className="flex flex-row items-center gap-1 price-old">
          <span className="sr-only">Old price: </span>
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

// Swedish krona is written after the number ("199 kr"); every other currency
// keeps the pre-symbol the card has always shown.
function Amount({ value, currency }: AmountProps) {
  if (currency === "SEK") {
    return (
      <>
        {value} kr
      </>
    );
  }

  return (
    <>
      <DollarSign aria-hidden="true" />
      {value}
    </>
  );
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
      <ShoppingCart aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
