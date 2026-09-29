"use client";
import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";

import { mockInventory } from "@/lib/mockInventory";
import ProductCard from "@/components/catalog/product-card";

export default function CatalogPage() {
  return (
    <main className="flex flex-col justify-center items-stretch pb-10">
      <Hero />
      <div className="px-15">
        <div className="mb-4 pb-2 pt-4 border-b">
          <p>Start / Katalog / Alla produkter </p>
        </div>

        <div className="flex flex-row gap-10">
          <Filter />
          <GridCollection
            cols={3}
            rows={4}
            className="w-full"
            itemsPerPage={12}
            items={mockInventory as Product[]}
            ariaLabel="products"
            renderItem={(item: Product, _: number) => (
              <ProductCard data={item} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
