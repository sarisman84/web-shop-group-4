import type { Metadata } from "next";
import ShopHeader from "@/components/shop/shop-header";

export const metadata: Metadata = {
  title: {
    default: "Nordic Retail",
    template: "%s | Nordic Retail",
  },
  description:
    "Shop the Nordic Retail catalogue: browse products, check availability and add your picks to the cart.",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ShopHeader />
      {children}
    </>
  );
}
