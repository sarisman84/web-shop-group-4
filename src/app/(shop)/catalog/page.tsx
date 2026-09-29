import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/product-filter";
import GridCollection from "@/components/collections/grid-collection";

import { mockInventory } from "@/lib/mockInventory";
import ProductCard from "@/components/catalog/product-card";

export default async function CatalogPage() {
  return (
    <main>
      <Hero />
      <div className="p-15 flex flex-row gap-10">
        <Filter />
        <GridCollection
          items={mockInventory as Product[]}
          ariaLabel="products"
          cols={3}
          rows={5}
          renderItem={(item: Product, _: number) => (
            <ProductCard data={item} />
          )}
        />
      </div>
    </main>
  );
}
