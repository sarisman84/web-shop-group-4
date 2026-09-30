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
          width={1920}
          height={1080}
          className="rounded-t-md"
        />
      </div>

      <div className="flex flex-row gap-5 px-4 pt-4 justify-between font-bold">
        <h3>{data.name}</h3>
        <div className="flex flex-row justify-center items-center gap-1">
          <Star size={"1rem"} />
          <p>{data.review_sum}</p>
        </div>
      </div>

      <div className="flex flex-row justify-between leading-4 px-4 pb-8 text-sm text-slate-500 text-left">
        <p>{data.category}</p>
        <p>{data.review_count} reviews</p>
      </div>

      <div className="flex flex-row justify-between p-4">
        <Price value={data.price} oldValue={data.price} />
        <AddToCartButton label="Add" />
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
    <div className="flex flex-row gap-2">
      <div className="flex flex-row">
        <DollarSign />
        <p>{value}</p>
      </div>
      {oldValue && (
        <div className="flex flex-row line-through text-sm text-slate-500 ">
          <DollarSign size={"1rem"}/>
          <p>{oldValue}</p>
        </div>
      )}
    </div>
  );
}

interface AddToCardButtonProps {
  label: string;
}

function AddToCartButton({ label }: AddToCardButtonProps) {
  return (
    <button
      className="bg-slate-900 flex flex-row p-2 rounded-xl gap-2"
      style={{ color: "#fff" }}
    >
      <ShoppingCart />
      <p>{label}</p>
    </button>
  );
}
