import { Product } from "@/types/product";

export interface ProductCardProps {
  data: Product;
}

export default function ProductCard(props : ProductCardProps) {
  return <div className="w-50 h-50 bg-amber-300"></div>;
}
