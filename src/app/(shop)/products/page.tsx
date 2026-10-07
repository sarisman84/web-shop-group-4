import { Product } from "@/types/product";
import Hero from "@/components/header/hero";
import Filter from "@/components/catalog/catalog-filter";
import GridCollection from "@/components/collections/grid-collection";
import { getCategories, getProducts, ProductsFetchError } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import { redirect } from "next/navigation";
import ProductCard from "@/components/catalog/product-card";
import type {
  Category,
  Product as AppProduct,
  ProductsResponse,
} from "@/app/admin/types";

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

  // PostgREST answers 416 ("Requested range not satisfiable") when the
  // requested page lies past the end of the result set, so a stale ?page=
  // (e.g. from a previously larger unfiltered listing) surfaces as a
  // ProductsFetchError with code "416". Fall back to the first page in that
  // case; if the first page also fails it is a real database error and is
  // rethrown.
  let result: ProductsResponse;
  let currentPage = requestedPage;
  try {
    result = await getProducts({ page: requestedPage, ...filter });
  } catch (error) {
    if (!(error instanceof ProductsFetchError) || error.code !== "416") {
      throw error;
    }
    currentPage = 1;
    result = await getProducts({ page: 1, ...filter });
  }
  const { products, pages } = result;

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
    <main className="flex flex-col justify-center items-stretch pb-10">
      <Hero />
      <div className="px-15">
        <div className="mb-4 pb-2 pt-4 border-b">
          <p>Start / Katalog / {crumb}</p>
        </div>

        <div className="flex flex-row gap-10">
          <Filter
            categories={categories}
            activeCategory={matchedCategory?.name}
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
