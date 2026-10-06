import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Stripe server client (T52, ADR-004: Stripe Hosted Checkout).
//
// Server-only: the secret key must never reach the browser. This module is
// imported only from server actions (src/app/(shop)/actions/checkout-actions.ts).
//
// The client is created lazily so importing this module never throws at build
// time; the missing-key error surfaces on the first checkout attempt instead.
// It is cached per server process, since the Stripe client holds no request
// state (unlike the cookie-aware Supabase client).
// ---------------------------------------------------------------------------

let client: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe test secret key to .env.local.",
    );
  }

  if (!client) {
    client = new Stripe(secretKey);
  }

  return client;
}