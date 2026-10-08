import { getTranslations } from "next-intl/server";
import ProductRow, {
  getLandingRowProducts,
} from "@/components/landing/product-row";
import PromoSection from "@/components/landing/promo-section";
import FeaturedGrid from "@/components/catalog/featured-grid";
import Review from "@/components/catalog/review";
import Kundservice from "@/components/catalog/kundservice";

export default async function HomePage() {
  const t = await getTranslations("home");

  const deals = await getLandingRowProducts({ sort: "discount_percentage" });
  const favorites = await getLandingRowProducts({
    sort: "rating",
    excludeIds: deals.map((product) => product.id),
  });

  const shownIds = [...deals, ...favorites].map((product) => product.id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main id="main-content" className="flex-1">
        <FeaturedGrid />

        <PromoSection
          eyebrow={t("promo.eyebrow")}
          // PromoSection substitutes {max} itself, so pass the raw ICU string
          // instead of letting t() try (and fail) to format the placeholder.
          title={t.raw("promo.title") as string}
          description={t("promo.description")}
          sort="discount_percentage"
          excludeIds={shownIds}
          imageSide="right"
          eager
        />

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <ProductRow title={t("rows.techDeals")} products={deals} />
          <Kundservice />
          <ProductRow title={t("rows.autumnFavorites")} products={favorites} />
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

        <Review />
      </main>
    </div>
  );
}
