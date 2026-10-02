import type { Metadata } from "next";
import ShopHeader from "@/components/header/shop-header";
import { countCartLines } from "@/lib/cart";
import { readCart } from "@/lib/cart-cookie";
import { createClient } from "@/utils/supabase/server";

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

  const supabase = await createClient();
  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("*");

  if (categoryError) {
    console.error("Error fetching categories:", categoryError);
  }

  return (
    <>
      <ShopHeader categories={categories ?? []} cartCount={cartCount} />
      {children}
    </>
  );
}
