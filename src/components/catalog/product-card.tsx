import { Product } from "@/types/product";
import { DollarSign, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data: product }: ProductCardProps) {
  return (
    <article className="card-surface">
      <div className="relative w-full aspect-[1/1]">
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          className="rounded-t-md"
        />
      </div>

      <div className="flex flex-row gap-5 px-4 pt-4 justify-between font-bold">
        <h2>{product.name}</h2>
        <span className="flex flex-row justify-center items-center gap-1">
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
        <Price value={product.price} oldValue={product.price} />
        <AddToCartButton label="Buy" id={product.id} />
      </div>
    </article>
  );
}

interface PriceProps {
  value: number;
  oldValue?: number;
}

function Price({ value, oldValue }: PriceProps) {
  return (
    <span className="flex flex-row gap-2">
      <span className="flex flex-row items-center gap-1">
        <DollarSign aria-hidden="true" />
        {value}
      </span>
      {oldValue && (
        <span className="flex flex-row items-center gap-1 price-old">
          <span className="sr-only">Old price: </span>
          <DollarSign size={"1rem"} aria-hidden="true" />
          {oldValue}
        </span>
      )}
    </span>
  );
}

interface AddToCardButtonProps {
  label: string;
  id: number;
}

function AddToCartButton({ label, id }: AddToCardButtonProps) {
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
