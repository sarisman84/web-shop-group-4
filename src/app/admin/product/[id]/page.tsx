import { notFound } from "next/navigation";
import ProductDetail from "@/app/admin/components/ProductDetail/ProductDetail";
import { getProduct } from "@/lib/data";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await getProduct(productId);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
