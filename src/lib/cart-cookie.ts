import { cookies } from "next/headers";
import {
  normalizeCartLines,
  parseCartValue,
  type CartLine,
} from "@/lib/cart";

export const CART_COOKIE_NAME = "cart";

const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function readCart(): Promise<CartLine[]> {
  const cookieStore = await cookies();
  return parseCartValue(cookieStore.get(CART_COOKIE_NAME)?.value);
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  const cookieStore = await cookies();
  const normalized = normalizeCartLines(lines);

  if (normalized.length === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
    return;
  }

  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(normalized), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}
