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

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  // Make sure to await both createClient() and getUser()
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <ShopHeader
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isAuthenticated={!!user}
        userEmail={user?.email ?? undefined}
      />
      {children}
      <ShopFooter />
    </>
  );
}
