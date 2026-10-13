import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Product } from "@/types/product";
import GridCollection from "@/components/collections/grid-collection";
import ProductCard from "@/components/catalog/product-card";
import {
  getProducts,
  ProductsFetchError,
  PGRST_RANGE_NOT_SATISFIABLE,
  type GetProductsParams,
} from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import type { Product as AppProduct } from "@/app/admin/types";

// Maps a data-layer product (camelCase, from Supabase) to the card's
// display shape (src/types/product).
function toCardItem(product: AppProduct, uncategorized: string): Product {
  return {
    id: product.id,
    name: product.title,
    category: product.category?.name ?? uncategorized,
    price: product.price,
    currency: "SEK",
    image: product.thumbnail,
    review_count: product.reviews?.length ?? 0,
    review_sum: product.rating ?? 0,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    minimumOrderQuantity: product.minimumOrderQuantity,
  };
}

interface CatalogGridProps {
  /** The active catalogue filters, ready for getProducts (no page/limit). */
  filterParams: Omit<GetProductsParams, "page" | "limit">;
  /** 1-based page number. */
  page: number;
  /** Rows per page. */
  limit: number;
  /** The raw searchParams, carried over by pagination and the page-1 redirect. */
  params: Record<string, string | string[] | undefined>;
}

// The catalogue's product grid, rendered behind its own Suspense boundary so a
// filter change shows a skeleton here (and only here) while getProducts
// resolves — the filter panel and toolbar stay interactive. The "N products
// found" count lives with the grid because it is derived from the same
// getProducts call.
export default async function CatalogGrid({
  filterParams,
  page,
  limit,
  params,
}: CatalogGridProps) {
  const [tProducts, tCommon, wishlist] = await Promise.all([
    getTranslations("products"),
    getTranslations("common"),
    readWishlist(),
  ]);

  // PostgREST answers 416 ("Requested range not satisfiable") when the
  // requested page lies past the end of the result set; supabase-js surfaces
  // it as error code PGRST103, so a stale ?page= (e.g. from a previously
  // larger unfiltered listing) surfaces as a ProductsFetchError with that
  // code. Redirect to page 1 (keeping the other filters) instead of fetching
  // page 1 here: the redirect re-runs this component at page 1, so a page-1
  // fetch now would only be discarded. Any other error is a real database
  // failure and is rethrown.
  let result;
  try {
    result = await getProducts({ ...filterParams, page, limit });
  } catch (error) {
    if (
      !(error instanceof ProductsFetchError) ||
      error.code !== PGRST_RANGE_NOT_SATISFIABLE
    ) {
      throw error;
    }
    // Keep every other active filter (category, search, brand, ...) and only
    // drop the stale page, so the URL matches the page the redirect renders.
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) query.append(key, item);
      } else {
        query.append(key, value);
      }
    }
    const qs = query.toString();
    redirect(qs ? `/products?${qs}` : "/products");
  }

  const { products, pages, total } = result;
  const totalPages = Math.max(1, pages);
  const items = products.map((p) => toCardItem(p, tProducts("uncategorized")));

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3">
        <span className="text-sm font-semibold text-text-primary">
          {tProducts("foundCount", { count: total })}
        </span>
      </div>
      {items.length > 0 ? (
        <GridCollection
          className="min-w-0 flex-1"
          customGridClassName="catalog-grid"
          itemsPerPage={limit}
          items={items}
          ariaLabel={tCommon("products")}
          currentPage={page}
          totalPages={totalPages}
          paginationProps={{
            basePath: "/products",
            searchParams: params,
          }}
          renderItem={(item: Product, index: number) => (
            <ProductCard
              data={item}
              wishlisted={wishlist.includes(item.id)}
              mediaHeight="catalogue"
              eager={index < 3}
            />
          )}
        />
      ) : (
        <p className="min-w-0 flex-1 text-gray-500 text-sm">
          {tProducts("noResults")}
        </p>
      )}
    </div>
  );
}
