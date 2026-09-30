import { Product } from "@/types/product";
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
                fill
                alt={data.name}
                className="rounded-t-md"
            />
        </div>

      <div className="flex flex-row gap-5 px-2 pt-2">
        <h3>{data.name}</h3>
        <p>{data.review_sum}</p>
      </div>

      <div className="flex flex-row justify-between leading-4 px-4 pb-8">
        <p className="text-sm text-slate-500 text-left">{data.category}</p>
        <p className="text-sm text-slate-500 text-left">{data.review_count} reviews</p>
      </div>

      <div className="flex flex-row justify-between p-4">
        <div className="flex flex-row gap-2">
          <p>{data.price}</p>
          <p className="line-through text-sm text-slate-500">{data.price}</p>
        </div>

        <button>Add</button>
      </div>
    </article>
  );
}
