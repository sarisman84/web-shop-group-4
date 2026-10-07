import { Product } from "@/types/product";
import GridCollection from "@/components/collections/grid-collection";
import ProductCard from "@/components/catalog/product-card";

interface ProductGridProps {
  products: Product[];
  itemsPerPage?: number;
  cols?: number;
  rows?: number;
  currentPage?: number;
  basePath?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ProductGrid({
  products,
  itemsPerPage = 12,
  cols = 3,
  rows = 4,
  currentPage = 1,
  basePath = "",
  searchParams,
}: ProductGridProps) {
  return (
    <GridCollection
      cols={cols}
      rows={rows}
      className="w-full"
      itemsPerPage={itemsPerPage}
      items={products}
      ariaLabel="products"
      currentPage={currentPage}
      paginationProps={{
        basePath,
        searchParams,
      }}
      renderItem={(item: Product, index: number) => (
        <ProductCard data={item} eager={index < 4} />
      )}
    />
  );
}
