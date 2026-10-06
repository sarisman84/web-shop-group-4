import ProductRow, {
  getLandingRowProducts,
} from "@/components/landing/product-row";
import PromoSection from "@/components/landing/promo-section";
import FeaturedGrid from "@/components/catalog/featured-grid";
import Review from "@/components/catalog/review";
import Kundservice from "@/components/catalog/kundservice";
import ShopFooter from "@/components/footer/shop-footer";

export default async function HomePage() {
  // The rows are fetched first so their ids can be handed to the promo
  // sections: a product should appear exactly once on the landing page, so the
  // collage promotes the next best matches rather than repeating the rows.
  const [deals, favorites] = await Promise.all([
    getLandingRowProducts({ sort: "discount_percentage" }),
    getLandingRowProducts({ sort: "rating" }),
  ]);

  const shownIds = [...deals, ...favorites].map((product) => product.id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Section */}
      {/* <Header /> */}

      {/* Main Content */}
      <main id="main-content" className="flex-1">

        {/* Featured Categories Grid */}
        <FeaturedGrid />

        {/* Promo Section — text left, collage right */}
        <PromoSection
          eyebrow="Produkt"
          title="Upp till {max}% på grejer"
          description="Erbjudandena uppdateras varje dag. Hitta prylar till halva priset innan nästa kampanj stänger."
          sort="discount_percentage"
          excludeIds={shownIds}
          imageSide="right"
        />

        {/* Landing Page Product Rows */}
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <ProductRow title="Veckans teknikdeals" products={deals} />
           <Kundservice />
          <ProductRow title="Höstens favoriter" products={favorites} />
        </div>

        {/* Promo Section — collage left, text right */}
        <PromoSection
          eyebrow="Favorit"
          title="Bäst betygsatta hos oss"
          description="Kundernas egna omdömen styr vilka produkter som lyfts fram här. Läs recensionerna och hitta din nästa favorit."
          sort="rating"
          excludeIds={shownIds}
          imageSide="left"
          ctaLabel="Se alla produkter"
        />

        {/* Customer Reviews */}
        <Review />

      
      </main>
      <ShopFooter />
    </div>
  );
}
