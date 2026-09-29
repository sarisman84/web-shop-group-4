import { Product } from "@/types/product";
import Image from "next/image";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data }: ProductCardProps) {
  return (
    <article className="bg-slate-200 rounded-md">
      <Image
        src={data.image}
        width={200}
        height={200}
        alt={data.name}
        className="rounded-t-md"
      />
      <div className="flex flex-row gap-5 px-2">
        <h3>{data.name}</h3>
        <p>{data.review_sum}</p>
      </div>

      <div className="flex flex-row justify-between leading-4 px-2 pb-4">
        <p>{data.category}</p>
        <p>{data.review_count} reviews</p>
      </div>

      <div className="flex flex-row justify-between p-2">
        <div className="flex flex-row gap-2">
          <p>{data.price}</p>
          <p>0</p>
        </div>

        <button>Add</button>
      </div>
    </article>
  );
}
