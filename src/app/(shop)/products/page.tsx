import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";

import { mockInventory } from "@/lib/mockInventory";
import { readWishlist } from "@/lib/wishlist-cookie";
import ProductCard from "@/components/catalog/product-card";

const ITEMS_PER_PAGE = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const items = mockInventory as Product[];
  const wishlist = await readWishlist();
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage),
  );

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
            itemsPerPage={ITEMS_PER_PAGE}
            items={items}
            ariaLabel="products"
            currentPage={currentPage}
            paginationProps={{
              basePath: "/products",
              searchParams: params,
            }}
            renderItem={(item: Product, _: number) => (
              <ProductCard data={item} wishlisted={wishlist.includes(item.id)} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
