import Hero from "@/components/header/hero";
import ProductRow from "@/components/landing/product-row";
import PromoSection from "@/components/landing/promo-section";
import { getCategories, getProducts } from "@/lib/data";
import type { Product } from "@/app/admin/types";
import FeaturedGrid from "@/components/catalog/featured-grid";
import Review from "@/components/catalog/review";
import Kundservice from "@/components/catalog/kundservice";
import ShopFooter from "@/components/footer/shop-footer";

// The landing page lists every match for the active category/search, so it
// asks the data layer for a large page instead of paginating.
// const MAX_RESULTS = 1000;

// interface PageProps {
//   searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
// }



export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Section */}
      {/* <Header /> */}

      {/* Main Content */}
      <main id="main-content" className="flex-1">

        {/* Featured Categories Grid */}
        <FeaturedGrid />

        {/* Promo Sections */}
        <div className="mx-auto max-w-7xl px-6 flex flex-col gap-6 pb-16">
          <PromoSection
            eyebrow="PRODUCT"
            title="Upp till 50% på grejer"
            description="Ett urval produkter till nedsatt pris, endast under en begränsad tid."
            image="/images/landing/promo-technik.png"
            imageAlt="Teknikprodukter till nedsatt pris"
            imageSide="right"
          />
          <PromoSection
            eyebrow="PRODUCT"
            title="Nya favoriter varje vecka"
            description="Nya produkter adderas löpande — håll koll på det senaste."
            image="/images/landing/promo-mode.png"
            imageAlt="Nya produkter i sortimentet"
            imageSide="left"
          />
        </div>

        {/* Landing Page Product Rows */}
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <ProductRow title="Veckans teknikdeals" sort="discount_percentage" />
           <Kundservice />
          <ProductRow title="Höstens favoriter" sort="rating" offset={3} />
        </div>

        {/* Customer Reviews */}
        <Review />

      
      </main>
      <ShopFooter />
    </div>
  );
}
