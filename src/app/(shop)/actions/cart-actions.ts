"use server";

import { getProduct } from "@/app/(admin)/lib/api";
import { normalizeStock } from "@/app/(admin)/components/productUtils";
import {
  INITIAL_CART_ACTION_STATE,
  addCartLine,
  countCartLines,
  removeCartLine,
  setCartLineQuantity,
  type CartActionState,
} from "@/lib/cart";
import { readCart, writeCart } from "@/lib/cart-cookie";

const INVALID_PRODUCT = "That product cannot be added to your cart.";
const UNAVAILABLE_PRODUCT = "This product is no longer available.";
const OUT_OF_STOCK = "This product is out of stock.";
const INVALID_QUANTITY = "Choose a quantity of at least 1.";

type PurchasableProduct =
  | { ok: true; stock: number }
  | { ok: false; error: string };

function readProductId(formData: FormData): number {
  const raw = formData.get("productId");
  const productId = typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(productId) ? productId : Number.NaN;
}

function readQuantity(formData: FormData): number {
  const raw = formData.get("quantity");
  const quantity = typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isInteger(quantity) ? quantity : Number.NaN;
}

// Form values and cookie contents are both client-controlled, so the real
// stock is re-read from the database before any line is written.
async function resolvePurchasableProduct(
  productId: number,
): Promise<PurchasableProduct> {
  if (!Number.isInteger(productId) || productId <= 0) {
    return { ok: false, error: INVALID_PRODUCT };
  }

  const product = await getProduct(productId);
  if (!product) {
    return { ok: false, error: UNAVAILABLE_PRODUCT };
  }

  const stock = normalizeStock(product.stock);
  if (stock === 0) {
    return { ok: false, error: OUT_OF_STOCK };
  }

  return { ok: true, stock };
}

export async function addToCartAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readProductId(formData);
  const purchasable = await resolvePurchasableProduct(productId);
  if (!purchasable.ok) {
    return { ...INITIAL_CART_ACTION_STATE, error: purchasable.error };
  }

  const quantity = readQuantity(formData);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ...INITIAL_CART_ACTION_STATE, error: INVALID_QUANTITY };
  }

  const lines = addCartLine(
    await readCart(),
    productId,
    quantity,
    purchasable.stock,
  );
  await writeCart(lines);

  return { ok: true, error: null, count: countCartLines(lines) };
}

export async function updateQuantityAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readProductId(formData);
  const purchasable = await resolvePurchasableProduct(productId);
  if (!purchasable.ok) {
    return { ...INITIAL_CART_ACTION_STATE, error: purchasable.error };
  }

  const quantity = readQuantity(formData);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ...INITIAL_CART_ACTION_STATE, error: INVALID_QUANTITY };
  }

  const lines = setCartLineQuantity(
    await readCart(),
    productId,
    quantity,
    purchasable.stock,
  );
  await writeCart(lines);

  return { ok: true, error: null, count: countCartLines(lines) };
}

export async function removeFromCartAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readProductId(formData);
  if (!Number.isInteger(productId) || productId <= 0) {
    return { ...INITIAL_CART_ACTION_STATE, error: INVALID_PRODUCT };
  }

  const lines = removeCartLine(await readCart(), productId);
  await writeCart(lines);

  return { ok: true, error: null, count: countCartLines(lines) };
}

export async function clearCartAction(): Promise<CartActionState> {
  await writeCart([]);

  return INITIAL_CART_ACTION_STATE;
}
