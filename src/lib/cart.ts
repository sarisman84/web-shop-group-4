import { z } from "zod";

export const MAX_CART_LINES = 50;
export const MAX_CART_QUANTITY = 99;

const cartLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export const cartSchema = z.array(cartLineSchema).max(MAX_CART_LINES);

export type CartLine = z.infer<typeof cartLineSchema>;

export interface CartActionState {
  isOk: boolean;
  error: string | null;
  count: number;
}

export const INITIAL_CART_ACTION_STATE: CartActionState = {
  isOk: false,
  error: null,
  count: 0,
};

function resolveLimit(maxQuantity: number): number {
  const normalized = Math.floor(Number.isFinite(maxQuantity) ? maxQuantity : 1);
  return Math.min(Math.max(normalized, 1), MAX_CART_QUANTITY);
}

// A cookie is user-writable, so nothing read back out of it is trusted
// blindly: duplicates are merged, quantities are re-capped and the line count
// is bounded before the value is used for anything.
export function normalizeCartLines(lines: CartLine[]): CartLine[] {
  const merged = new Map<number, number>();

  for (const line of lines) {
    const next = (merged.get(line.productId) ?? 0) + line.quantity;
    merged.set(line.productId, Math.min(next, MAX_CART_QUANTITY));
  }

  return [...merged.entries()]
    .slice(0, MAX_CART_LINES)
    .map(([productId, quantity]) => ({ productId, quantity }));
}

export function parseCartValue(rawValue: string | undefined): CartLine[] {
  if (!rawValue) return [];

  try {
    const result = cartSchema.safeParse(JSON.parse(rawValue));
    return result.success ? normalizeCartLines(result.data) : [];
  } catch {
    return [];
  }
}

export function countCartLines(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function addCartLine(
  lines: CartLine[],
  productId: number,
  quantity: number,
  maxQuantity: number,
): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);
  const requested = (existing?.quantity ?? 0) + Math.floor(quantity);

  return normalizeCartLines([
    ...lines.filter((line) => line.productId !== productId),
    { productId, quantity: Math.min(requested, resolveLimit(maxQuantity)) },
  ]);
}

export function setCartLineQuantity(
  lines: CartLine[],
  productId: number,
  quantity: number,
  maxQuantity: number,
): CartLine[] {
  if (quantity < 1) {
    return removeCartLine(lines, productId);
  }

  return normalizeCartLines([
    ...lines.filter((line) => line.productId !== productId),
    { productId, quantity: Math.min(Math.floor(quantity), resolveLimit(maxQuantity)) },
  ]);
}

export function removeCartLine(lines: CartLine[], productId: number): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}
