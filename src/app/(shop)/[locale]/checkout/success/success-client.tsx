"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  completeCheckout,
  type CompleteCheckoutResult,
} from "@/app/(shop)/actions/checkout-actions";

function formatKronor(amount: number): string {
  return `${amount.toFixed(2)} kr`;
}

const MISSING_SESSION: CompleteCheckoutResult = {
  isOk: false,
  orderId: null,
  total: null,
  email: null,
  error: "Missing payment session.",
};

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
  const [result, setResult] = useState<CompleteCheckoutResult | null>(
    sessionId ? null : MISSING_SESSION,
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
            error: "Something went wrong confirming your order. Please contact us.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  if (!result) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">Confirming your payment…</p>
      </main>
    );
  }

  if (!result.isOk) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto size-10 text-amber-500" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          We could not confirm your order
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{result.error}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/cart"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Back to cart
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Thank you for your order!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A confirmation will be sent to {result.email}.
      </p>

      <dl className="mt-8 space-y-2 rounded-xl border p-5 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Order number</dt>
          <dd className="font-mono text-xs text-foreground">{result.orderId}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Total paid</dt>
          <dd className="font-medium text-foreground">
            {result.total === null ? "—" : formatKronor(result.total)}
          </dd>
        </div>
      </dl>

      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Continue shopping
      </Link>
    </main>
  );
}