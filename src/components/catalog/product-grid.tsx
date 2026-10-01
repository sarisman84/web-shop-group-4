"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import GridCollection from "@/components/collections/grid-collection";
import ProductCard from "@/components/catalog/product-card";

interface ProductGridProps {
  products: Product[];
  itemsPerPage?: number;
  cols?: number;
  rows?: number;
}

export default function ProductGrid({
  products,
  itemsPerPage = 12,
  cols = 3,
  rows = 4,
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <GridCollection
      cols={cols}
      rows={rows}
      className="w-full"
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      items={products}
      ariaLabel="products"
      renderItem={(item: Product, _: number) => (
        <ProductCard data={item} />
      )}
      paginationProps={{
        onPageChange: (page: number) => setCurrentPage(page),
      }}
    />
  );
}
