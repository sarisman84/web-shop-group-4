import { z } from "zod";

export const MAX_WISHLIST_ITEMS = 100;

const wishlistSchema = z.array(z.number().int().positive()).max(MAX_WISHLIST_ITEMS);

export type Wishlist = z.infer<typeof wishlistSchema>;

// A cookie is user-writable, so nothing read back out of it is trusted
// blindly: duplicates are dropped and the item count is bounded before use.
export function normalizeWishlist(ids: Wishlist): Wishlist {
  return [...new Set(ids)].slice(0, MAX_WISHLIST_ITEMS);
}

export function parseWishlistValue(rawValue: string | undefined): Wishlist {
  if (!rawValue) return [];

  try {
    const result = wishlistSchema.safeParse(JSON.parse(rawValue));
    return result.success ? normalizeWishlist(result.data) : [];
  } catch {
    return [];
  }
}

export function toggleWishlistItem(ids: Wishlist, productId: number): Wishlist {
  return normalizeWishlist(
    ids.includes(productId)
      ? ids.filter((id) => id !== productId)
      : [...ids, productId],
  );
}