import { Product } from "@/types/product";
import Image from "next/image";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data }: ProductCardProps) {
  return (
    <article className="w-50 h-50 bg-amber-300">
      <header>
        <Image
          src={data.image}
          width={200}
          height={200}
          alt={data.name}
        />
        <div className="flex flex-row gap-5 p-2">
          <h3>{data.name}</h3>
          <p>{data.review_sum}</p>
        </div>

        <div className="flex flex-row justify-between p-2">
          <p>{data.category}</p>
          <p>{data.review_count} reviews</p>
        </div>
      </header>
    </article>
  );
}
