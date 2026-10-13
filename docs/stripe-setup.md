# Stripe Setup

Checkout uses [Stripe Hosted Checkout](https://docs.stripe.com/payments/checkout)
(ADR-004): the browser is redirected to a Stripe-hosted payment page, so no card
data touches our code.

## Credentials

Add your Stripe test secret key to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
```

The key is server-only — it is read by `src/lib/stripe.ts`, which is imported
only from server actions. Optionally set `NEXT_PUBLIC_SITE_URL`
(e.g. `https://your-deployment.vercel.app`) so Stripe redirects back to the
right host; it falls back to the request host, which works for
`localhost:3000`.

## The Flow

The flow lives in `src/app/(shop)/actions/checkout-actions.ts`:

1. **`createCheckoutSession`** reads the cart from the httpOnly cookie,
   re-reads every product name and price from Supabase (cart contents never
   determine the amount charged), and starts a Hosted Checkout session in SEK.
   The browser is redirected to the returned `url`.
2. Stripe collects the delivery address (`shipping_address_collection`, SE
   only) and charges shipping through a single `shipping_options` entry that
   uses the same rule as the cart summary: flat rate, free over the threshold
   (see `getShippingCost` in `src/lib/cart.ts`). A signed-in user's saved
   default address is prefilled through a referenced Stripe Customer.
3. **`completeCheckout`** — called by the success page — verifies the paid
   session with Stripe, rebuilds the order from the paid line items, records it
   through `src/lib/data/orders.ts` (including the collected shipping address
   and the session user) and clears the cart. A cookie remembers the processed
   session so refreshing the success page does not create a duplicate order.
