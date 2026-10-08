import { randomUUID } from "node:crypto";
import { getSupabase } from "./_client";
import type {
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from "@/types/database";

// ---------------------------------------------------------------------------
// orders / order_items — the single entry point for every read from and write
// to the Supabase `orders` and `order_items` tables (T53).
//
// Server-only: every function below runs on the server with the shared
// cookie-aware client from `./_client`, so RLS policies always see the
// caller's real session (anon for guest checkout, authenticated when signed
// in). Pages, server actions and components must import these functions
// instead of building `supabase.from("orders")` queries of their own.
//
// Row -> app type mapping: the tables store snake_case columns; the app uses
// the camelCase `Order` type. `toOrder` converts here so consumers never see
// raw rows.
// ---------------------------------------------------------------------------

export type { OrderStatus };

/** One line of an order, as rendered in an order summary. */
export interface OrderLine {
  /** Null if the product was deleted after the order; `name`/`price` are
   * snapshots taken at checkout, so the line still renders. */
  productId: number | null;
  name: string;
  price: number;
  quantity: number;
}

/** The shipping-address snapshot an order keeps for itself (T109): what was
 * delivered to, copied from Stripe at checkout — never re-read from the
 * address book afterwards, exactly like the order's name and email. */
export interface ShippingAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

/** An order with its lines, used by order history and the confirmation view. */
export interface Order {
  id: string;
  status: OrderStatus;
  customerEmail: string;
  customerName: string;
  total: number;
  stripeSessionId: string | null;
  createdAt: string;
  items: OrderLine[];
  /** Null for orders that predate the T109 migration (they have no address
   * stored — the columns read back as empty strings). */
  shippingAddress: ShippingAddress | null;
}

/** Checkout input. Prices and names are never taken from the caller — only
 * the product id and quantity are, and the catalogue is re-read. */
export interface CreateOrderInput {
  customerEmail: string;
  customerName: string;
  items: { productId: number; quantity: number }[];
  /** Set when a signed-in user checks out; omit for a guest order. */
  userId?: string | null;
  /** Stripe Checkout Session id when the order is created after payment. */
  stripeSessionId?: string | null;
  /** Shipping amount in kronor, folded into `total` (there is no shipping
   * column). Defaults to 0. */
  shipping?: number;
  /** The delivery address Stripe collected at checkout; it is snapshotted onto
   * the order. Defaults to null (omitted from the insert — the columns carry
   * an empty-string default for pre-migration rows). */
  shippingAddress?: ShippingAddress | null;
}

export interface CreateOrderResult {
  orderId: string;
  total: number;
}

type OrderRowWithItems = OrderRow & { order_items?: OrderItemRow[] | null };

/**
 * Converts one raw `orders` row (snake_case, with the embedded `order_items`
 * relation) into the camelCase `Order` type used by the app.
 */
function toOrder(row: OrderRowWithItems): Order {
  const addressFields = {
    street: row.shipping_street,
    postalCode: row.shipping_postal_code,
    city: row.shipping_city,
    country: row.shipping_country,
  };
  const hasAddress = Object.values(addressFields).some((field) => field.trim() !== "");

  return {
    id: row.id,
    status: row.status,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    total: row.total,
    stripeSessionId: row.stripe_session_id,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: hasAddress ? addressFields : null,
  };
}

/**
 * Creates an order and its lines after a successful payment.
 *
 * The line prices and names are snapshots read back from the `products` table,
 * never trusted from the caller: the cart only supplies an id and a quantity.
 * The order id is generated here (rather than read back after insert) because
 * RLS hides a freshly inserted guest order, and `.select()` would then report
 * "no rows" on a write that actually succeeded.
 *
 * `order_items` are inserted after the order, in one batch. The two inserts
 * are not a single transaction (PostgREST has no multi-statement transaction
 * here), so a failed line insert triggers a best-effort delete of the orphan
 * order before the error is rethrown. A guest order may survive that cleanup,
 * because only authenticated customers carry a delete policy.
 *
 * `status` is `paid` when a Stripe session id is supplied (the caller reached
 * here after payment) and `pending` otherwise.
 *
 * Throws on validation and database errors.
 *
 * @example
 * ```ts
 * // src/app/checkout/success/actions.ts (server action, T52)
 * import { createOrder } from "@/lib/data";
 *
 * const { orderId, total } = await createOrder({
 *   customerName,
 *   customerEmail,
 *   items: cartLines,              // [{ productId, quantity }]
 *   userId: user?.id ?? null,      // null for a guest
 *   stripeSessionId: session.id,
 * });
 * ```
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const customerEmail = input.customerEmail.trim();
  const customerName = input.customerName.trim();

  if (!customerEmail || !customerName) {
    throw new Error("An order needs a customer name and email.");
  }

  const requested = input.items.filter(
    (line) =>
      Number.isInteger(line.productId) &&
      line.productId > 0 &&
      Number.isInteger(line.quantity) &&
      line.quantity > 0,
  );

  if (requested.length === 0) {
    throw new Error("An order needs at least one item.");
  }

  const supabase = await getSupabase();
  const productIds = [...new Set(requested.map((line) => line.productId))];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, title, price")
    .in("id", productIds);

  if (productsError) {
    throw new Error(
      `Unable to load products for the order: ${productsError.message}`,
    );
  }

  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  const missing = productIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new Error(
      `These products are no longer available: ${missing.join(", ")}.`,
    );
  }

  const items = requested.map((line) => {
    const product = byId.get(line.productId)!;
    return {
      product_id: product.id,
      name: product.title,
      price: product.price,
      quantity: line.quantity,
    };
  });

  // Sum the goods in kronor, add shipping, then round to two decimals so a
  // basket of odd prices does not leave a floating-point tail in the total.
  const goodsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping =
    input.shipping && input.shipping > 0 ? input.shipping : 0;
  const total = Math.round((goodsTotal + shipping) * 100) / 100;

  const orderId = randomUUID();
  const address = input.shippingAddress ?? null;

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    user_id: input.userId ?? null,
    customer_email: customerEmail,
    customer_name: customerName,
    total,
    status: input.stripeSessionId ? "paid" : "pending",
    stripe_session_id: input.stripeSessionId ?? null,
    shipping_street: address?.street.trim() ?? "",
    shipping_postal_code: address?.postalCode.trim() ?? "",
    shipping_city: address?.city.trim() ?? "",
    shipping_country: address?.country.trim() ?? "",
  });

  if (orderError) {
    throw new Error(`Unable to create the order: ${orderError.message}`);
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: orderId })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw new Error(`Unable to create the order items: ${itemsError.message}`);
  }

  return { orderId, total };
}

/**
 * The signed-in caller's orders, newest first, each with its lines embedded.
 * Returns an empty array for a guest, because the RLS select policy only
 * grants rows to authenticated users.
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/account/orders/page.tsx (server component)
 * const orders = await getOrders();
 * ```
 */
export async function getOrders(): Promise<Order[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load orders: ${error.message}`);

  return (data ?? []).map(toOrder);
}

/**
 * Single order with its lines embedded. Returns `null` when the order does not
 * exist or the caller is not allowed to read it (so pages can `notFound()`).
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/checkout/success/page.tsx
 * const order = await getOrder(orderId);
 * if (!order) notFound();
 * ```
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load order ${orderId}: ${error.message}`);

  return data ? toOrder(data) : null;
}