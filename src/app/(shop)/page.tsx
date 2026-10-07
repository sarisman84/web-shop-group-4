import ProductRow, {
  getLandingRowProducts,
} from "@/components/landing/product-row";
import PromoSection from "@/components/landing/promo-section";
import FeaturedGrid from "@/components/catalog/featured-grid";
import Review from "@/components/catalog/review";
import Kundservice from "@/components/catalog/kundservice";
// import ShopFooter from "@/components/footer/shop-footer";

export default async function HomePage() {
  // Fetched in order rather than in parallel: the second row excludes the
  // first row's products, which only the database can do once it knows them.
  // A product should appear exactly once on the landing page, so the promo
  // collages below promote the next best matches instead of repeating the
  // rows.
  const deals = await getLandingRowProducts({ sort: "discount_percentage" });
  const favorites = await getLandingRowProducts({
    sort: "rating",
    excludeIds: deals.map((product) => product.id),
  });

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

    </div>
  );
}
