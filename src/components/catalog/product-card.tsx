import { Product } from "@/types/product";
import { ShoppingCart, Star, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard({ data: product }: ProductCardProps) {
  const hasSale = false;

  return (
    <article className="product-card">
      <div
        className="product-card-thumbnail relative"
        style={{ height: "328px" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          className="product-card-thumbnail-img"
        />

        {hasSale && <span className="product-badge">Sale</span>}

        <button
          type="button"
          className="product-favorite absolute top-3 right-3"
          aria-label="Add to favorites"
        >
          <Heart size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="product-card-body">
        <div className="row-between">
          <h2 className="product-name">{product.name}</h2>
          <ReviewSummary sum={product.review_sum} />
        </div>
        <div className="row-between pb-5">
          <p className="product-category">{product.category}</p>
          <span className="product-review-count">
            {product.review_count} reviews
          </span>
        </div>

        <div className="row-between">
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

interface ReviewSummaryProps {
  sum: number;
}

function ReviewSummary({ sum }: ReviewSummaryProps) {
  return (
    <div className="product-review">
      <Star
        size={12}
        className="text-text-primary"
        fill="currentColor"
        stroke="currentColor"
        aria-hidden="true"
      />
      <span className="product-review-sum">{sum}</span>
    </div>
  );
}

interface PriceProps {
  value: number;
}

function Price({ value }: PriceProps) {
  return (
    <span className="flex flex-row items-center gap-1 product-price">
      <span aria-hidden="true">$</span>
      {value}
    </span>
  );
}
