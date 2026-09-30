import { Product } from "@/types/product";
import { Star } from "lucide-react";
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
        <div className="flex flex-row justify-center items-center">
          <Star size={"1rem"} />
          <p>{data.review_sum}</p>
        </div>
      </div>

      <div className="flex flex-row justify-between leading-4 px-4 pb-8">
        <p className="text-sm text-slate-500 text-left">{data.category}</p>
        <p className="text-sm text-slate-500 text-left">
          {data.review_count} reviews
        </p>
      </div>

      <div className="flex flex-row justify-between p-4">
        <div className="flex flex-row gap-2">
          <div>
            <p>{data.price}</p>
          </div>

          <div className="line-through text-sm text-slate-500">
            <p>{data.price}</p>
          </div>
        </div>

        <button>
          <p>Add</p>
        </button>
      </div>
    </article>
  );
}
