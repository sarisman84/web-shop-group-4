import Hero from "@/components/header/hero";
import { getCategories, getProducts } from "@/lib/data";
import type { Product } from "@/app/admin/types";
import FeaturedGrid from "@/components/catalog/featured-grid";
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
        
      </main>
      <ShopFooter />
    </div>
  );
}