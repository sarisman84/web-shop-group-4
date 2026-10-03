"use server";

import { readWishlist, writeWishlist } from "@/lib/wishlist-cookie";
import { toggleWishlistItem } from "@/lib/wishlist";

// Stored in a cookie rather than a table, so nothing here touches RLS. The
// action returns the new state so the caller can render it without waiting for
// the router refresh.
export async function toggleWishlistAction(productId: number): Promise<boolean> {
  const wishlist = await readWishlist();
  const next = toggleWishlistItem(wishlist, productId);

  await writeWishlist(next);

  return next.includes(productId);
}