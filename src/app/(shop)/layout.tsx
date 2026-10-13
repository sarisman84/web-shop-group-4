import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ShopHeader from "@/components/header/shop-header";
import { countCartLines } from "@/lib/cart";
import { readCart } from "@/lib/cart-cookie";
import { readWishlist } from "@/lib/wishlist-cookie";
import { getCategories } from "@/lib/data";
import type { Category } from "@/app/admin/types";
import { createClient } from "@/lib/supabaseServer";
import ShopFooter from "@/components/footer/shop-footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: {
      default: t("title"),
      template: "%s | Group 4",
    },
    description: t("description"),
  };
}

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cartCount = countCartLines(await readCart());
  const wishlistCount = (await readWishlist()).length;

  // Make sure to await both createClient() and getClaims(). getClaims()
  // verifies the session JWT locally (no network round trip), unlike
  // getUser() which hits the Auth service on every render — and the claims
  // carry everything the header needs (auth state + email).
  const supabase = await createClient();

  const [claimsResult, categories] = await Promise.all([
    supabase.auth.getClaims(),
    getCategories().catch((error) => {
      console.error("Error fetching categories:", error);
      return [] as Category[];
    }),
  ]);
  const claims = claimsResult.data?.claims;

  const tHeader = await getTranslations("header");

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-lg focus:outline-2 focus:outline-[#0d5c56]"
      >
        {tHeader("skipToContent")}
      </a>
      <ShopHeader
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isAuthenticated={!!claims}
        userEmail={claims?.email ?? undefined}
      />
      {/* Grows to fill the space between header and footer (the body is a flex
          column), so the footer sits at the bottom of the window on short pages. */}
      <div className="flex-1">{children}</div>
      <ShopFooter />
    </>
  );
}
