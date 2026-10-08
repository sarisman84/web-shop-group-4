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
//
// The customer helpers (T109) belong here too: creating/reusing a Stripe
// Customer whose shipping is the buyer's saved default address is how hosted
// Checkout prefills it (hosted Checkout cannot take a shipping address as a
// session parameter — the prefill travels on the referenced Customer).
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

/**
 * Normalizes the free-text `country` of a saved address (T98 stores it as
 * text, e.g. "Sverige") into the ISO 3166-1 alpha-2 code Stripe's Customer
 * shipping address expects. Two-letter values pass through, a small map
 * covers the common Swedish/English names, and anything unrecognized falls
 * back to {@link defaultCode}. Checkout only ships domestically (SE) today,
 * so "SE" is the sensible default.
 */
export function toIsoCountryCode(
  country: string,
  defaultCode = "SE",
): string {
  const normalized = country.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(normalized)) return normalized.toUpperCase();

  const codes: Record<string, string> = {
    sverige: "SE",
    sweden: "SE",
    norge: "NO",
    norway: "NO",
    danmark: "DK",
    denmark: "DK",
    finland: "FI",
    tyskland: "DE",
    germany: "DE",
    usa: "US",
    "united states": "US",
    storbritannien: "GB",
    uk: "GB",
    "united kingdom": "GB",
  };

  return codes[normalized] ?? defaultCode;
}

/** The saved default address of a signed-in user, as sourced for Stripe
 * prefill. Shipping totals are unchanged — the address is only a starting
 * point the customer may edit on the hosted page (`customer_update.shipping`). */
export interface StripeCustomerPrefill {
  /** The app user the Customer is tied to (stored in customer metadata so the
   * same Customer is reused across checkouts, never duplicated). */
  userId: string;
  /** Optional: some sessions may not have one; Stripe still needs a shipping
   * name, which falls back to `name`, then to `""`. */
  email?: string;
  name?: string;
  street: string;
  postalCode: string;
  city: string;
  /** Free text; normalized to an ISO code via {@link toIsoCountryCode}. */
  country: string;
}

/**
 * Returns the signed-in user's Stripe Customer, creating it on first checkout
 * and keeping its shipping address in sync with the saved default address.
 *
 * Checkout is told which Customer to use (`customer` on the Session), and the
 * Customer's `shipping` is what hosted Checkout pre-fills into the address
 * form — the only mechanism hosted Checkout offers for prefill. Because the
 * Customer is found by the `user_id` metadata key, one user always maps to one
 * Customer regardless of how many addresses they save.
 *
 * Throws when Stripe rejects the request.
 */
export async function getOrCreateStripeCustomer(
  input: StripeCustomerPrefill,
): Promise<Stripe.Customer> {
  const stripe = getStripe();
  const userId = input.userId.trim();

  const existing = await stripe.customers.search({
    // user ids are uuids — no quote-escaping hazard in the search query.
    query: `metadata["user_id"]:"${userId}"`,
    limit: 1,
  });

  const customer =
    existing.data[0] ??
    (await stripe.customers.create({
      email: input.email,
      name: input.name,
      metadata: { user_id: userId },
    }));

  const code = toIsoCountryCode(input.country);

  await stripe.customers.update(customer.id, {
    shipping: {
      name: input.name ?? input.email ?? "",
      address: {
        line1: input.street,
        city: input.city,
        postal_code: input.postalCode,
        country: code,
      },
    },
  });

  return customer;
}