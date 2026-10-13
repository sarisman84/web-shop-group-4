import { getTranslations } from "next-intl/server";
import ProductRow, {
  getLandingRowProducts,
} from "@/components/landing/product-row";
import PromoSection from "@/components/landing/promo-section";
import Kundservice from "@/components/catalog/kundservice";

// The landing page's product content as a single suspending unit. Every
// section must show different products, so each one excludes the ids of the
// sections above it — a dependency chain that forces the queries to run in
// order (deals → favorites → both promos). Owning that chain here, instead of
// in the page, lets the page stream its static hero immediately and let this
// block fill in behind a Suspense boundary.
export default async function LandingProductSections() {
  const t = await getTranslations("home");

  const deals = await getLandingRowProducts({ sort: "discount_percentage" });
  const favorites = await getLandingRowProducts({
    sort: "rating",
    excludeIds: deals.map((product) => product.id),
  });

  const shownIds = [...deals, ...favorites].map((product) => product.id);

  return (
    <>
      <PromoSection
        eyebrow={t("promo.eyebrow")}
        // PromoSection substitutes {max} itself, so pass the raw ICU string
        // instead of letting t() try (and fail) to format the placeholder.
        title={t.raw("promo.title") as string}
        description={t("promo.description")}
        ctaLabel={t("promo.cta")}
        sort="discount_percentage"
        excludeIds={shownIds}
        imageSide="right"
        eager
      />

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <ProductRow
          title={t("rows.techDeals")}
          href="/products?sale=true&sort=discount_percentage"
          products={deals}
        />
        <Kundservice />
        <ProductRow
          title={t("rows.autumnFavorites")}
          href="/products?sort=rating"
          products={favorites}
          linkLabel={t("rows.seeAll")}
        />
      </div>

      <PromoSection
        eyebrow={t("promo2.eyebrow")}
        title={t("promo2.title")}
        description={t("promo2.description")}
        sort="rating"
        excludeIds={shownIds}
        imageSide="left"
        ctaLabel={t("promo2.cta")}
      />
    </>
  );
}
