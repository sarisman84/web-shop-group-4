import { Product } from "@/types/product";
import { DollarSign, ShoppingCart, Star, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data: product }: ProductCardProps) {
  const hasSale = false;

  return (
    <article className="product-card">
      <div className="product-card-thumbnail relative" style={{ height: "328px" }}>
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          className="product-card-thumbnail-img"
        />

        {hasSale && (
          <span className="product-badge">Sale</span>
        )}

        <button
          type="button"
          className="product-favorite absolute top-3 right-3"
          aria-label="Add to favorites"
        >
          <Heart size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="product-card-body">
        <p className="text-xs font-normal text-text-secondary uppercase">{product.category}</p>

        <div className="flex flex-row items-center gap-1 text-xs">
          <Star size={12} className="text-text-primary" fill="currentColor" stroke="currentColor" aria-hidden="true" />
          <span className="text-sm font-bold text-text-primary">{product.review_sum}</span>
          <span className="text-xs text-text-secondary">{product.review_count} svar</span>
        </div>

        <h2 className="text-base font-semibold text-text-primary">{product.name}</h2>

        <div className="flex flex-row items-center justify-between">
          <Price value={product.price} />
          <Link
            href={`/products/${product.id}`}
            type="button"
            className="btn-buy"
          >
            <ShoppingCart size={14} aria-hidden="true" />
            <span>Köp</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

interface PriceProps {
  value: number;
}

function Price({ value }: PriceProps) {
  return (
    <span className="flex flex-row items-center gap-1 text-base font-bold text-text-primary">
      <DollarSign size={16} aria-hidden="true" />
      {value}
    </span>
  );
}

