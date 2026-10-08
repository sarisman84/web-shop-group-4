import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { XCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("metaCancel"), robots: { index: false, follow: false } };
}

export default async function CheckoutCancelPage() {
  const t = await getTranslations("checkout");

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
      <XCircle className="mx-auto size-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {t("cancelledTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("cancelledText")}
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/cart"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t("backToCart")}
        </Link>
        <Link
          href="/products"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </main>
  );
}