"use server";

import { getProduct } from "@/lib/data";
import { normalizeStock } from "@/app/admin/components/productUtils";
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

function belowMinimum(minimum: number): string {
  return `The minimum order for this product is ${minimum}.`;
}

type PurchasableProduct =
  | { isOk: true; stock: number; minimumOrderQuantity: number }
  | { isOk: false; error: string };

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
    return { isOk: false, error: INVALID_PRODUCT };
  }

  const product = await getProduct(productId);
  if (!product) {
    return { isOk: false, error: UNAVAILABLE_PRODUCT };
  }

  const stock = normalizeStock(product.stock);
  if (stock === 0) {
    return { isOk: false, error: OUT_OF_STOCK };
  }

  // A minimum above the remaining stock could never be met, so it is capped.
  const minimumOrderQuantity = Math.min(
    Math.max(Math.floor(product.minimumOrderQuantity ?? 1), 1),
    stock,
  );

  return { isOk: true, stock, minimumOrderQuantity };
}

export async function addToCartAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readProductId(formData);
  const purchasable = await resolvePurchasableProduct(productId);
  if (!purchasable.isOk) {
    return { ...INITIAL_CART_ACTION_STATE, error: purchasable.error };
  }

  const quantity = readQuantity(formData);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ...INITIAL_CART_ACTION_STATE, error: INVALID_QUANTITY };
  }

  const current = await readCart();
  const inCart = current.find((line) => line.productId === productId)?.quantity ?? 0;
  if (inCart + quantity < purchasable.minimumOrderQuantity) {
    return {
      ...INITIAL_CART_ACTION_STATE,
      error: belowMinimum(purchasable.minimumOrderQuantity),
    };
  }

  const lines = addCartLine(current, productId, quantity, purchasable.stock);
  await writeCart(lines);

  return { isOk: true, error: null, count: countCartLines(lines) };
}

export async function updateQuantityAction(
  _previousState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readProductId(formData);
  const purchasable = await resolvePurchasableProduct(productId);
  if (!purchasable.isOk) {
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

  return { isOk: true, error: null, count: countCartLines(lines) };
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

  return { isOk: true, error: null, count: countCartLines(lines) };
}

export async function clearCartAction(): Promise<CartActionState> {
  await writeCart([]);

  return INITIAL_CART_ACTION_STATE;
}
