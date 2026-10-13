import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import FeaturedGrid from "@/components/catalog/featured-grid";
import Review from "@/components/catalog/review";
import LandingProductSections from "@/components/landing/landing-product-sections";
import {
  LandingSectionsSkeleton,
  ReviewSkeleton,
} from "@/components/landing/landing-skeletons";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col bg-white">
      <main id="main-content" className="flex-1">
        <h1 className="sr-only">{t("heading")}</h1>

        {/* The hero is static, so it streams out immediately. The product
            sections and the reviews band each sit behind their own Suspense
            boundary and stream in as their queries resolve, instead of the
            whole page waiting for the slowest one. */}
        <FeaturedGrid />

        <Suspense fallback={<LandingSectionsSkeleton />}>
          <LandingProductSections />
        </Suspense>

        <Suspense fallback={<ReviewSkeleton />}>
          <Review />
        </Suspense>
      </main>
    </div>
  );
}
