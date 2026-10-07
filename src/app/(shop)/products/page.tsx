import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getProducts, getStockSummary } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import ProductCard from "@/components/catalog/product-card";
import type { Product as AppProduct } from "@/app/admin/types";

const ITEMS_PER_PAGE = 12;

// Maps a data-layer product (camelCase, from Supabase) to the card's
// display shape (src/types/product).
function toCardItem(product: AppProduct): Product {
  return {
    id: product.id,
    name: product.title,
    category: product.category?.name ?? "Uncategorized",
    price: product.price,
    currency: "SEK",
    image: product.thumbnail,
    review_count: product.reviews?.length ?? 0,
    review_sum: product.rating ?? 0,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Clamp the requested page to the real catalogue size, like the old
  // client-side pagination did (getStockSummary only reads the stock
  // column, so this stays cheap).
  const { total } = await getStockSummary();
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage),
  );

  const [{ products }, wishlist] = await Promise.all([
    getProducts({ page: currentPage, limit: ITEMS_PER_PAGE }),
    readWishlist(),
  ]);
  const items = products.map(toCardItem);

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
            totalPages={totalPages}
            paginationProps={{
              basePath: "/products",
              searchParams: params,
            }}
            renderItem={(item: Product, index: number) => (
              <ProductCard
                data={item}
                wishlisted={wishlist.includes(item.id)}
                eager={index < 3}
              />
            )}
          />
        </div>
      </div>
    </main>
  );
}
