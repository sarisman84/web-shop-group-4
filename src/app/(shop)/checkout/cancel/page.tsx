import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-20 text-center">
      <XCircle className="mx-auto size-12 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Your payment was cancelled
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You have not been charged. Your cart is still saved if you would like to
        try again.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/cart"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to cart
        </Link>
        <Link
          href="/products"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}