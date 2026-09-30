import { Product } from "@/types/product";
import { DollarSign, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data }: ProductCardProps) {
  return (
    <article className="bg-slate-200 rounded-md">
      <div className="relative w-full aspect-[1/1]">
        <Image
          src={data.image}
          alt={data.name}
          width={800}
          height={800}
          className="rounded-t-md"
        />
      </div>

      <div className="flex flex-row gap-5 px-4 pt-4 justify-between font-bold">
        <h2>{data.name}</h2>
        <span className="flex flex-row justify-center items-center gap-1">
          <Star size={"1rem"} fill="black" stroke="black" aria-hidden="true" />
          {data.review_sum}
          <span className="sr-only"> out of 5 stars</span>
        </span>
      </div>

      <div className="flex flex-row justify-between leading-4 px-4 pb-8 text-sm text-slate-600 text-left">
        <span>{data.category}</span>
        <span>{data.review_count} reviews</span>
      </div>

      <div className="flex flex-row justify-between p-4">
        <Price value={data.price} oldValue={data.price} />
        <AddToCartButton label="Add to cart" />
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
        <span className="flex flex-row items-center gap-1 line-through text-sm text-slate-600">
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
}

function AddToCartButton({ label }: AddToCardButtonProps) {
  return (
    <button
      type="button"
      className="bg-slate-900 text-white flex flex-row items-center p-2 rounded-xl gap-2"
    >
      <ShoppingCart aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
