import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import CatalogFilter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getCatalogFacets, getCategories, getProducts } from "@/lib/data";
import { parseFilters, toGetProductsParams } from "@/lib/catalog-filters";
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
  const filters = parseFilters(params);
  const [categories, facets] = await Promise.all([
    getCategories(),
    getCatalogFacets(),
  ]);
  const filterParams = toGetProductsParams(filters, { categories });

  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const requestedPage = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);

  const [first, wishlist] = await Promise.all([
    getProducts({ ...filterParams, page: requestedPage, limit: ITEMS_PER_PAGE }),
    readWishlist(),
  ]);
  const totalPages = Math.max(1, first.pages);
  const currentPage = Math.min(totalPages, requestedPage);
  const { products } =
    currentPage === requestedPage
      ? first
      : await getProducts({ ...filterParams, page: currentPage, limit: ITEMS_PER_PAGE });
  const items = products.map(toCardItem);

  return (
    <main className="flex flex-col justify-center items-stretch pb-10">
      <Hero />
      <div className="px-15">
        <div className="mb-4 pb-2 pt-4 border-b">
          <p>Start / Katalog / Alla produkter </p>
        </div>

        <div className="flex flex-row gap-10">
          <CatalogFilter
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            brands={facets.brands}
            priceBounds={facets.priceBounds}
          />
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
            renderItem={(item: Product, _: number) => (
              <ProductCard data={item} wishlisted={wishlist.includes(item.id)} />
            )}
          />
        </div>
      </div>
    </main>
  );
}
