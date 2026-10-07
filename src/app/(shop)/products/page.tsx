import { Product } from "@/types/product";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getCategories, getProducts } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import ProductCard from "@/components/catalog/product-card";
import CategoryIntroduction from "@/components/header/category-introduction";
import type {
  Category,
  Product as AppProduct,
} from "@/app/admin/types";
import { redirect } from "next/navigation";

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
  const { products, pages, total } =
    currentPage === requestedPage
      ? first
      : await getProducts({ page: currentPage, ...filter });

  // Redirect so the URL matches the rendered page (e.g. ?page=99 becomes
  // clean — page 1 is the default, so the param is dropped).
  if (currentPage !== requestedPage) {
    redirect("/products");
  }

  const wishlist = await readWishlist();
  const items = products.map(toCardItem);

  // Breadcrumb trail reflects the active filters. Use the matched category
  // name (not the raw URL param) so unknown names like ?category=Foo still
  // show "Alla produkter" rather than an empty category. When both search
  // and category are active, show the category first, then the search term.
  const matchedCategory = categories.find((c) => c.name === categoryParam);
  const crumb = matchedCategory && searchQuery
    ? `${matchedCategory.name} / Sökresultat för "${searchQuery}"`
    : matchedCategory
      ? matchedCategory.name
      : searchQuery
        ? `Sökresultat för "${searchQuery}"`
        : "Alla produkter";

  return (
    <main className="flex flex-col justify-center items-stretch bg-bg-page pb-10">
      <CategoryIntroduction
        title="Teknik"
        subtitle="Lorem ipsum dolor sit amet consectetur. Risus risus vitae quam molestie dui. Rhoncus nec pellentesque tempus sit donec. Vitae massa porttitor integer quisque est augue tristique. Id consequat viverra tincidunt erat a malesuada nisl."
      />
      <div className="px-16">
        <div className="mx-auto w-full max-w-[1312px]">
          <nav className="mb-4 pb-2 pt-4 border-b border-border-default">
            <p className="text-sm text-text-secondary">
              Start / Katalog / {crumb}
            </p>
          </nav>

          <div className="mb-4 row-between">
            <span className="text-sm font-semibold text-text-primary">
              {total} produkter funna
            </span>
            <div className="flex flex-row gap-3">
              <button
                type="button"
                className="inline-flex flex-row items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-sm font-semibold text-text-primary"
              >
                Filter
              </button>
              <button
                type="button"
                className="inline-flex flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-text-primary"
              >
                Mest populära
              </button>
            </div>
          </div>

          <div className="flex w-full flex-row gap-8">
            <Filter />
            {items.length > 0 ? (
              <GridCollection
                className="min-w-0 flex-1"
                customGridClassName="grid grid-cols-3 grid-rows-4 gap-6"
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
                  <ProductCard
                    data={item}
                    wishlisted={wishlist.includes(item.id)}
                    mediaHeight="catalogue"
                  />
                )}
              />
            ) : (
              <p className="text-gray-500 text-sm">Inga produkter hittades.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
