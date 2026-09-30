import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getProduct } from "@/app/admin/lib/api";
import ProductDetail from "./product-detail";
import ProductJsonLd from "./product-json-ld";

const MAX_DESCRIPTION_LENGTH = 155;

// generateMetadata and the page both need the product, and fetch memoization
// only covers the fetch API, so the Supabase query is wrapped in React cache to
// keep it to a single round trip per request.
const getProductOnce = cache(getProduct);

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function parseProductId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;

  const productId = Number(rawId);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

function buildDescription(title: string, description: string): string {
  const summary = description.trim() || `Buy ${title} online at Nordic Retail.`;

  if (summary.length <= MAX_DESCRIPTION_LENGTH) return summary;

  return `${summary.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

async function resolveProduct(rawId: string) {
  const productId = parseProductId(rawId);

  if (productId === null) return null;

  return getProductOnce(productId);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await resolveProduct(id);

  if (!product) {
    return { title: "Product not found" };
  }

  const description = buildDescription(product.title, product.description);

  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      ...(product.thumbnail
        ? { images: [{ url: product.thumbnail, alt: product.title }] }
        : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await resolveProduct(id);

  if (!product) notFound();

  return (
    <>
      <ProductJsonLd
        product={product}
        url={`/products/${product.id}`}
      />
      <ProductDetail product={product} />
    </>
  );
}
