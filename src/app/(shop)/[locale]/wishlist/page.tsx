import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import Breadcrumbs from "@/components/catalog/breadcrumbs";
import ProductCard from "@/components/catalog/product-card";
import CategoryIntroduction from "@/components/header/category-introduction";
import { getProduct } from "@/lib/data";
import { readWishlist } from "@/lib/wishlist-cookie";
import type { Product } from "@/types/product";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("wishlistPage");
  return {
    title: t("title"),
    // Personal, cookie-based list: nothing for a search engine to index.
    robots: { index: false, follow: false },
  };
}

// The wishlist lives in a cookie (src/lib/wishlist-cookie.ts), so the page
// reads the saved ids and loads each product again, like the cart does. A
// product that no longer exists is skipped.
export default async function WishlistPage() {
  const [t, tProducts, tCommon] = await Promise.all([
    getTranslations("wishlistPage"),
    getTranslations("products"),
    getTranslations("common"),
  ]);

  const ids = await readWishlist();
  const loaded = await Promise.all(ids.map((id) => getProduct(id)));

  // Newest first: the cookie keeps ids in the order they were saved.
  const items: Product[] = loaded
    .flatMap((product) => (product ? [product] : []))
    .reverse()
    .map((product) => ({
      id: product.id,
      name: product.title,
      category: product.category?.name ?? tProducts("uncategorized"),
      price: product.price,
      currency: "SEK",
      image: product.thumbnail,
      review_count: product.reviews?.length ?? 0,
      review_sum: product.rating ?? 0,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      minimumOrderQuantity: product.minimumOrderQuantity,
    }));

  return (
    <main
      id="main-content"
      className="flex flex-col justify-center items-stretch bg-bg-page pb-10 min-w-0 overflow-x-clip"
    >
      <CategoryIntroduction
        category={{ name: t("title"), description: t("intro") }}
      />
      <div className="catalog-gutter">
        <div className="catalog-column">
          <Breadcrumbs
            items={[
              { label: tProducts("start"), href: "/" },
              { label: t("title") },
            ]}
            ariaLabel={tCommon("breadcrumbs")}
          />

          {items.length > 0 ? (
            <>
              <div className="catalog-toolbar">
                <span className="text-sm font-semibold text-text-primary">
                  {t("count", { count: items.length })}
                </span>
              </div>
              <ul className="catalog-grid">
                {items.map((item, index) => (
                  <li key={item.id} className="min-w-0">
                    <ProductCard
                      data={item}
                      wishlisted
                      mediaHeight="catalogue"
                      eager={index < 3}
                      headingLevel="h2"
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <h2 className="text-xl font-semibold text-text-primary">
                {t("emptyTitle")}
              </h2>
              <p className="max-w-md text-sm text-gray-600">{t("emptyHint")}</p>
              <Link
                href="/products"
                className={buttonVariants({ variant: "default" })}
              >
                {t("browse")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
