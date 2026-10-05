import type { Product } from "@/app/admin/types";
import {
  getDiscountPercentage,
  getDiscountedPrice,
  getStockStatus,
  normalizeStock,
  type StockStatus,
} from "@/app/admin/components/productUtils";

const AVAILABILITY: Record<StockStatus, string> = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "out-of-stock": "https://schema.org/OutOfStock",
};

const CURRENCY = "USD";

interface ProductJsonLdProps {
  product: Product;
  url: string;
}

export default function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const stock = normalizeStock(product.stock);
  const { status } = getStockStatus(stock);
  const price = getDiscountedPrice(
    product.price,
    getDiscountPercentage(product.discountPercentage),
  );

  const images = [
    ...new Set(
      [product.thumbnail, ...product.images].filter(
        (image) => typeof image === "string" && image.trim().length > 0,
      ),
    ),
  ];

  const reviews = product.reviews ?? [];
  const description =
    product.description.trim() || `${product.title} available at Nordic Retail.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image: images,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    aggregateRating:
      product.rating !== undefined && reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.reviewerName },
      datePublished: review.date,
      reviewBody: review.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: CURRENCY,
      price: price.toFixed(2),
      availability: AVAILABILITY[status],
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Escaping "<" keeps a product description from closing the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
