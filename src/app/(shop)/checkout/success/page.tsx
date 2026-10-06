import type { Metadata } from "next";
import CheckoutSuccessClient from "./success-client";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";

  return <CheckoutSuccessClient sessionId={sessionId} />;
}