"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCheckoutSession } from "@/app/(shop)/actions/checkout-actions";
import { getShippingCost } from "@/lib/cart";

export interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function formatKronor(amount: number): string {
  return `${amount.toFixed(2)} kr`;
}

/**
 * Client half of the checkout page: a summary of what will be charged plus the
 * "Pay" button that starts the Stripe Hosted Checkout session and redirects the
 * browser to Stripe.
 */
export default function CheckoutClient({ items }: { items: CheckoutItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  function handlePay() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (result.url) {
        // Leaving the app for Stripe's hosted payment page.
        window.location.assign(result.url);
      } else {
        setError(result.error ?? "The payment could not be started.");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Kassan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Granska din beställning och betala säkert med Stripe.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <div className="size-16 shrink-0 rounded-lg border bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {formatKronor(item.price)}
                </p>
              </div>
              <p className="font-medium text-foreground">
                {formatKronor(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-border p-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatKronor(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-foreground">
              {shipping === 0 ? "Free" : formatKronor(shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt className="text-foreground">Total</dt>
            <dd className="text-foreground">{formatKronor(total)}</dd>
          </div>
        </dl>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={isPending}
        className="mt-4 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Redirecting to Stripe…" : "Pay with Stripe"}
      </button>

      <Link
        href="/cart"
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to cart
      </Link>
    </main>
  );
}