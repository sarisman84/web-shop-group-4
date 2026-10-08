"use server";

import { cookies, headers } from "next/headers";
import type Stripe from "stripe";
import { createOrder, getAddresses, getProduct } from "@/lib/data";
import type { ShippingAddress } from "@/lib/data";
import { getUserProfile } from "@/lib/data/userdata";
import { readCart, writeCart } from "@/lib/cart-cookie";
import { getShippingCost } from "@/lib/cart";
import { getOrCreateStripeCustomer, getStripe } from "@/lib/stripe";

// ---------------------------------------------------------------------------
// Stripe Checkout server actions (T52, ADR-004: Stripe Hosted Checkout).
//
// createCheckoutSession: builds a Stripe Hosted Checkout Session from the
// cookie cart and returns its URL for the client to redirect to. Since T109
// Stripe also collects the delivery address (SE) and the shipping method
// (`shipping_address_collection` + a single `shipping_options` entry matching
// the cart summary — the manual "Frakt" line item is gone), and a signed-in
// user with a saved default address gets it prefilled through a referenced
// Stripe Customer.
//
// completeCheckout: called by the success page, verifies the paid session with
// Stripe, records the order through the T53 data layer — including the
// collected shipping address and the session user - clears the cart and
// returns the confirmation details.
//
// Both run on the server. Prices are always re-read from Supabase, never taken
// from the browser, so a tampered cart cannot change what is charged. The order
// is rebuilt from the paid Stripe line items, so it records what was actually
// paid even if the cart changes between payment and redirect.
// ---------------------------------------------------------------------------

// Remembers the session already turned into an order, so refreshing the success
// page does not create a duplicate.
const CHECKOUT_ORDER_COOKIE = "checkout_order";

export interface CreateCheckoutSessionResult {
  url: string | null;
  error: string | null;
}

export interface CompleteCheckoutResult {
  isOk: boolean;
  orderId: string | null;
  total: number | null;
  email: string | null;
  /** The delivery address Stripe collected, snapshotted onto the order
   * (null for orders recorded without one). */
  shippingAddress: ShippingAddress | null;
  error: string | null;
}

interface ProcessedCheckout {
  sessionId: string;
  orderId: string;
  total: number;
  email: string;
}

function readProcessedCheckout(raw: string | undefined): ProcessedCheckout | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ProcessedCheckout>;
    if (parsed.sessionId && parsed.orderId) {
      return {
        sessionId: parsed.sessionId,
        orderId: parsed.orderId,
        total: typeof parsed.total === "number" ? parsed.total : 0,
        email: parsed.email ?? "",
      };
    }
  } catch {
    // Ignore a malformed cookie and treat the checkout as not yet processed.
  }
  return null;
}

/** Absolute origin Stripe should redirect back to: a configured site URL when
 * present, otherwise the request's own host (works for localhost and Vercel). */
async function resolveOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

/**
 * Creates a Stripe Checkout Session for the current cart and returns its URL.
 *
 * The cart is read from the httpOnly cookie and each product's name and price
 * is fetched from Supabase again, so the amount charged matches the catalogue.
 * Stripe collects the delivery address and charges shipping through a single
 * `shipping_options` entry chosen with the same rule as the cart summary.
 * A signed-in user's saved default address is prefilled via a referenced
 * Stripe Customer when present.
 *
 * Returns `{ url, error: null }` on success, or `{ url: null, error }` when the
 * cart is empty or a line is no longer available.
 */
export async function createCheckoutSession(): Promise<CreateCheckoutSessionResult> {
  const cartLines = await readCart();
  if (cartLines.length === 0) {
    return { url: null, error: "Your cart is empty." };
  }

  const products = await Promise.all(
    cartLines.map((line) => getProduct(line.productId)),
  );

  let subtotal = 0;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartLines.flatMap(
    (line, index) => {
    const product = products[index];
    if (!product) return [];

    subtotal += product.price * line.quantity;

    return [
      {
        quantity: line.quantity,
        price_data: {
          currency: "sek",
          // Kronor -> öre (Stripe's smallest SEK unit).
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.title,
            // Carried through to the success action so the order can be rebuilt
            // from what was actually paid.
            metadata: { product_id: String(product.id) },
          },
        },
      },
    ];
  });

  if (lineItems.length === 0) {
    return { url: null, error: "The products in your cart are no longer available." };
  }

  // One option per checkout, chosen with the same rule as the cart summary:
  // free at/ over the threshold, else the flat fee. Stripe shows the single
  // option and charges it, so the price table and the cart never drift, and
  // the customer always sees the correct shipping amount up front.
  const shipping = getShippingCost(subtotal);
  const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          currency: "sek",
          amount: Math.round(shipping * 100),
        },
        display_name: shipping === 0 ? "Fri frakt" : "Frakt",
      },
    },
  ];

  const origin = await resolveOrigin();

  // A signed-in user with a saved default address gets it prefilled on the
  // hosted page. Hosted Checkout has no shipping-address *session* parameter,
  // so the prefill travels on a referenced Stripe Customer whose shipping is
  // that address (and `customer_update.shipping: "auto"` lets the customer
  // change it on the hosted page). A failure here is not fatal: checkout
  // simply continues without prefill.
  let customerId: string | null = null;
  try {
    const user = await getUserProfile();

    if (user) {
      // getAddresses orders the default row first (T98); the zero-th entry is
      // the one checkout should preselect. Guests get no rows at all.
      const [defaultAddress] = await getAddresses();

      if (defaultAddress) {
        const customer = await getOrCreateStripeCustomer({
          userId: user.id,
          email: user.email,
          name: user.fullName || user.email,
          street: defaultAddress.street,
          postalCode: defaultAddress.postalCode,
          city: defaultAddress.city,
          country: defaultAddress.country,
        });
        customerId = customer.id;
      }
    }
  } catch (error) {
    console.error("Failed to prefill the checkout shipping address:", error);
  }

  try {
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      // Stripe collects the address and the shipping method inside the hosted
      // page (T109). Domestic flat-rate shipping only today; expanding the
      // allowed countries later needs per-country rates (see the T109 scope).
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["SE"],
      },
      shipping_options: shippingOptions,
    };

    if (customerId) {
      params.customer = customerId;
      // "auto": collect shipping only because shipping_address_collection is
      // on, letting the buyer edit the prefilled address.
      params.customer_update = { shipping: "auto" };
    }

    const session = await getStripe().checkout.sessions.create(params);

    if (!session.url) {
      return { url: null, error: "Stripe did not return a checkout URL." };
    }

    return { url: session.url, error: null };
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);
    return { url: null, error: "The payment could not be started. Please try again." };
  }
}

/**
 * Completes a checkout after Stripe redirects back to the success page.
 *
 * Verifies the session with Stripe, records an order from the paid line items
 * (via the T53 data layer), clears the cart and returns the confirmation data.
 *
 * A short-lived httpOnly cookie remembers the session that was already
 * processed, so refreshing the success page does not create a second order.
 */
export async function completeCheckout(
  sessionId: string,
): Promise<CompleteCheckoutResult> {
  if (!sessionId) {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email: null,
      shippingAddress: null,
      error: "Missing payment session.",
    };
  }

  const cookieStore = await cookies();
  const processed = readProcessedCheckout(
    cookieStore.get(CHECKOUT_ORDER_COOKIE)?.value,
  );
  if (processed && processed.sessionId === sessionId) {
    return {
      isOk: true,
      orderId: processed.orderId,
      total: processed.total,
      email: processed.email,
      shippingAddress: null,
      error: null,
    };
  }

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });
  } catch (error) {
    console.error(`Failed to retrieve Stripe session ${sessionId}:`, error);
    return {
      isOk: false,
      orderId: null,
      total: null,
      email: null,
      shippingAddress: null,
      error: "We could not verify your payment. Please contact us if you were charged.",
    };
  }

  if (session.payment_status !== "paid") {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email: null,
      shippingAddress: null,
      error: "This payment has not been completed.",
    };
  }

  const email = session.customer_details?.email ?? null;
  if (!email) {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email: null,
      shippingAddress: null,
      error: "Stripe did not return a customer email for this payment.",
    };
  }

  // Rebuild the order from the paid line items: product lines carry the
  // product id in metadata. Shipping is no longer a line item — since T109 it
  // is selected via shipping_options, so the amount comes from the session's
  // shipping_cost; the per-line sum below only covers sessions created before
  // that (their "Frakt" line carried no product id).
  const items: { productId: number; quantity: number }[] = [];
  let legacyShipping = 0;
  for (const line of session.line_items?.data ?? []) {
    const quantity = line.quantity ?? 0;
    const product = line.price?.product;
    const metadata =
      product && typeof product !== "string" && !("deleted" in product)
        ? product.metadata
        : undefined;
    const productId = Number(metadata?.product_id ?? "");

    if (Number.isInteger(productId) && productId > 0 && quantity > 0) {
      items.push({ productId, quantity });
    } else {
      legacyShipping += (line.amount_subtotal ?? 0) / 100;
    }
  }

  const shipping = session.shipping_cost
    ? (session.shipping_cost.amount_total ?? 0) / 100
    : legacyShipping;

  if (items.length === 0) {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email,
      shippingAddress: null,
      error: "No orderable items were found on this payment.",
    };
  }

  // Snapshot the delivery address Stripe collected (T109): what was actually
  // shipped, stored on the order exactly like the customer name and email.
  // Stripe v23 exposes it under `collected_information.shipping_details` (the
  // old top-level `shipping_details` field is gone).
  const collectedAddress =
    session.collected_information?.shipping_details?.address;
  const shippingAddress: ShippingAddress | null = collectedAddress
    ? {
        street: [collectedAddress.line1, collectedAddress.line2]
          .filter((value): value is string => Boolean(value))
          .join(", "),
        postalCode: collectedAddress.postal_code ?? "",
        city: collectedAddress.city ?? "",
        country: collectedAddress.country ?? "",
      }
    : null;

  // Attribute the order to the signed-in session when there is one (T93 made
  // this possible, T97 order history depends on it); guest checkout keeps
  // user_id null as the RLS insert policy on `orders` requires.
  const user = await getUserProfile();

  try {
    const { orderId, total } = await createOrder({
      customerName: session.customer_details?.name ?? email,
      customerEmail: email,
      items,
      shipping,
      shippingAddress,
      userId: user?.id ?? null,
      stripeSessionId: sessionId,
    });

    await writeCart([]);

    cookieStore.set(
      CHECKOUT_ORDER_COOKIE,
      JSON.stringify({ sessionId, orderId, total, email }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
      },
    );

    return { isOk: true, orderId, total, email, shippingAddress, error: null };
  } catch (error) {
    console.error(`Failed to record order for Stripe session ${sessionId}:`, error);
    return {
      isOk: false,
      orderId: null,
      total: null,
      email,
      shippingAddress,
      error: "Your payment went through, but the order could not be recorded. Please contact us.",
    };
  }
}