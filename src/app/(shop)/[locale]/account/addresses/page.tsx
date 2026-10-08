import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAddresses } from "@/lib/data";
import { getUserProfile } from "@/lib/data/userdata";
import AddressesClient from "./AddressesClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("addresses");
  return {
    title: t("title"),
    // Personal data: nothing for a search engine to index.
    robots: { index: false, follow: false },
  };
}

/**
 * Saved delivery addresses (T98, PRD §5.3 Child US5). Lists the signed-in
 * user's `addresses` rows and hands them to the client, which drives the
 * add / edit / delete forms through the server actions in
 * `src/app/(shop)/actions/address-actions.ts`.
 *
 * A visitor without a session is sent to the login page — the same gate the
 * account page uses; the owner-only RLS policies on `addresses` are the
 * actual security boundary.
 */
export default async function DeliveryAddressesPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login?redirect=/account/addresses");
  }

  const addresses = await getAddresses();

  return <AddressesClient initialAddresses={addresses} />;
}
