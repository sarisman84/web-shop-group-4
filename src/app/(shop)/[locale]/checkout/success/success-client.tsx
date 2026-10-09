"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { Link } from "@/i18n/routing";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  completeCheckout,
  type CompleteCheckoutResult,
} from "@/app/(shop)/actions/checkout-actions";

/**
 * Runs the confirmation once on mount: it asks the server action to verify the
 * Stripe session, create the order and clear the cart. The server remembers the
 * processed session in a cookie, so a refresh returns the same order instead of
 * creating another one.
 */
export default function CheckoutSuccessClient({
  sessionId,
}: {
  sessionId: string;
}) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [result, setResult] = useState<CompleteCheckoutResult | null>(
    sessionId
      ? null
      : {
          isOk: false,
          orderId: null,
          total: null,
          email: null,
          shippingAddress: null,
          error: t("missingSession"),
        },
  );

  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    completeCheckout(sessionId)
      .then((response) => {
        if (active) setResult(response);
      })
      .catch(() => {
        if (active) {
          setResult({
            isOk: false,
            orderId: null,
            total: null,
            email: null,
            shippingAddress: null,
            error: t("confirmError"),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId, t]);

  if (!result) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">{t("confirming")}</p>
      </main>
    );
  }

  if (!result.isOk) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-amber-500" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          {t("couldNotConfirm")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/cart"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("backToCart")}
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {t("thanks")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("confirmationSent", { email: result.email ?? "" })}
      </p>

      <dl className="mt-8 space-y-2 rounded-xl border p-5 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("orderNumber")}</dt>
          <dd className="font-mono text-xs text-foreground">{result.orderId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("totalPaid")}</dt>
          <dd className="font-medium text-foreground">
            {result.total === null ? "—" : formatMoney(result.total, locale)}
          </dd>
        </div>
        {result.shippingAddress ? (
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">{t("deliveryTo")}</dt>
            <dd className="text-right text-foreground">
              <span className="block">{result.shippingAddress.street}</span>
              <span className="block text-muted-foreground">
                {result.shippingAddress.postalCode} {result.shippingAddress.city}
                {result.shippingAddress.country
                  ? `, ${result.shippingAddress.country}`
                  : ""}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>

      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {t("continueShopping")}
      </Link>
    </main>
  );
}