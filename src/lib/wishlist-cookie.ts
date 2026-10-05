import { cookies } from "next/headers";
import {
  normalizeWishlist,
  parseWishlistValue,
  type Wishlist,
} from "@/lib/wishlist";

export const WISHLIST_COOKIE_NAME = "wishlist";

const WISHLIST_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function readWishlist(): Promise<Wishlist> {
  const cookieStore = await cookies();
  return parseWishlistValue(cookieStore.get(WISHLIST_COOKIE_NAME)?.value);
}

export async function writeWishlist(ids: Wishlist): Promise<void> {
  const cookieStore = await cookies();
  const normalized = normalizeWishlist(ids);

  if (normalized.length === 0) {
    cookieStore.delete(WISHLIST_COOKIE_NAME);
    return;
  }

  cookieStore.set(WISHLIST_COOKIE_NAME, JSON.stringify(normalized), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WISHLIST_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}