import type { Metadata } from "next";
import ShopHeader from "@/components/header/shop-header";
import { countCartLines } from "@/lib/cart";
import { readCart } from "@/lib/cart-cookie";
import { getCategories } from "@/lib/data";
import type { Category } from "@/app/admin/types";
import { createClient } from "@/lib/supabaseServer";
import ShopFooter from "@/components/footer/shop-footer";

export const metadata: Metadata = {
  title: {
    default: "Nordic Retail",
    template: "%s | Nordic Retail",
  },
  description:
    "Shop the Nordic Retail catalogue: browse products, check availability and add your picks to the cart.",
};

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cartCount = countCartLines(await readCart());

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
        isAuthenticated={!!user}
        userEmail={user?.email ?? undefined}
      />
      {children}
      <ShopFooter />

    </>
  );
}