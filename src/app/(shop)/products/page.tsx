import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getCategories, getProducts } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import ProductCard from "@/components/catalog/product-card";
import type { Category, Product as AppProduct } from "@/app/admin/types";

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

// searchParams values arrive as string[] when a param is repeated
// (?category=a&category=b); the header only ever writes a single value.
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // The header writes ?category=<name> and ?search=<term>. The data layer
  // filters on the category id, so resolve the name first; unknown names
  // simply show all products.
  const categories: Category[] = await getCategories();
  const categoryParam = firstParam(params.category);
  const categoryId = categories.find((c) => c.name === categoryParam)?.id;
  const searchQuery = firstParam(params.search)?.trim() || undefined;

  const rawPage = Number.parseInt(String(params.page ?? "1"), 10);
  const requestedPage = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);

  const filter = { limit: ITEMS_PER_PAGE, categoryId, search: searchQuery };
  const first = await getProducts({ page: requestedPage, ...filter });

  // A stale ?page= (e.g. from a previously larger unfiltered listing) can
  // point past the end of a smaller filtered result set; refetch the last
  // valid page instead of showing an empty grid.
  const currentPage = Math.min(requestedPage, Math.max(1, first.pages));
  const { products, pages } =
    currentPage === requestedPage
      ? first
      : await getProducts({ page: currentPage, ...filter });

  const wishlist = await readWishlist();
  const items = products.map(toCardItem);

  // Breadcrumb trail reflects the active filters.
  const crumb = searchQuery
    ? `Sökresultat för "${searchQuery}"`
    : categoryParam
      ? categoryParam
      : "Alla produkter";

  return (
    <main className="flex flex-col justify-center items-stretch pb-10">
      <Hero />
      <div className="px-15">
        <div className="mb-4 pb-2 pt-4 border-b">
          <p>Start / Katalog / {crumb}</p>
        </div>

        <div className="flex flex-row gap-10">
          <Filter
            categories={categories}
            activeCategory={categoryId ? categoryParam : undefined}
          />
          {items.length > 0 ? (
            <GridCollection
              cols={3}
              rows={4}
              className="w-full"
              itemsPerPage={ITEMS_PER_PAGE}
              items={items}
              ariaLabel="products"
              currentPage={currentPage}
              totalPages={Math.max(1, pages)}
              paginationProps={{
                basePath: "/products",
                searchParams: params,
              }}
              renderItem={(item: Product) => (
                <ProductCard data={item} wishlisted={wishlist.includes(item.id)} />
              )}
            />
          ) : (
            <p className="text-gray-500 text-sm">Inga produkter hittades.</p>
          )}
        </div>
      </div>
    </main>
  );
}
