import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { readCart } from "@/lib/cart-cookie";
import { getProduct } from "@/lib/data";
import CheckoutClient, { type CheckoutItem } from "./checkout-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: t("metaTitle"),
    // A checkout page has nothing to index and must not appear in search.
    robots: { index: false, follow: false },
  };
}

/**
 * Checkout review page. Reads the cookie cart and resolves each line against
 * the catalogue, then hands the summary to the client which starts the Stripe
 * session. An empty (or fully unavailable) cart sends the visitor back.
 */
export default async function CheckoutPage() {
  const locale = await getLocale();
  const cartLines = await readCart();
  if (cartLines.length === 0) redirect({ href: "/cart", locale });

  const resolved = await Promise.all(
    cartLines.map(async (line): Promise<CheckoutItem | null> => {
      const product = await getProduct(line.productId);
      if (!product) return null;

      return {
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: line.quantity,
        image: product.thumbnail || product.images?.[0] || "",
      };
    }),
  );

  const items = resolved.filter(
    (item): item is CheckoutItem => item !== null,
  );

  if (items.length === 0) redirect({ href: "/cart", locale });

  return <CheckoutClient items={items} />;
}