import type { Metadata } from "next";
import ShopHeader from "@/components/header/shop-header";
import { countCartLines } from "@/lib/cart";
import { readCart } from "@/lib/cart-cookie";
import { getCategories } from "@/lib/data";
import type { Category } from "@/app/admin/types";

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

  // The header keeps working (with an empty menu) if the database is down,
  // so a failed lookup degrades to no categories instead of breaking the page.
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <>
      <ShopHeader categories={categories} cartCount={cartCount} />
      {children}
    </>
  );
}
