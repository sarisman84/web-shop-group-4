"use server";

import { cookies, headers } from "next/headers";
import type Stripe from "stripe";
import { createOrder, getProduct } from "@/lib/data";
import { readCart, writeCart } from "@/lib/cart-cookie";
import { getShippingCost } from "@/lib/cart";
import { getStripe } from "@/lib/stripe";

// ---------------------------------------------------------------------------
// Stripe Checkout server actions (T52, ADR-004: Stripe Hosted Checkout).
//
// createCheckoutSession: builds a Stripe Hosted Checkout Session from the
// cookie cart and returns its URL for the client to redirect to.
//
// completeCheckout: called by the success page, verifies the paid session with
// Stripe, records the order through the T53 data layer, clears the cart and
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
 * Shipping is added as its own line using the same rule as the cart summary.
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

  const shipping = getShippingCost(subtotal);
  if (shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "sek",
        unit_amount: Math.round(shipping * 100),
        product_data: { name: "Frakt" },
      },
    });
  }

  const origin = await resolveOrigin();

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // Stripe collects the email/name the confirmation and order need.
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

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
      error: "We could not verify your payment. Please contact us if you were charged.",
    };
  }

  if (session.payment_status !== "paid") {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email: null,
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
      error: "Stripe did not return a customer email for this payment.",
    };
  }

  // Rebuild the order from the paid line items: product lines carry the
  // product id in metadata, the shipping line has none and is summed separately.
  const items: { productId: number; quantity: number }[] = [];
  let shipping = 0;
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
      shipping += (line.amount_subtotal ?? 0) / 100;
    }
  }

  if (items.length === 0) {
    return {
      isOk: false,
      orderId: null,
      total: null,
      email,
      error: "No orderable items were found on this payment.",
    };
  }

  try {
    const { orderId, total } = await createOrder({
      customerName: session.customer_details?.name ?? email,
      customerEmail: email,
      items,
      shipping,
      // Placeholder until Supabase Auth is wired up: no sign-in exists yet, so
      // orders are recorded as guest orders (user_id null).
      userId: null,
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

    return { isOk: true, orderId, total, email, error: null };
  } catch (error) {
    console.error(`Failed to record order for Stripe session ${sessionId}:`, error);
    return {
      isOk: false,
      orderId: null,
      total: null,
      email,
      error: "Your payment went through, but the order could not be recorded. Please contact us.",
    };
  }
}