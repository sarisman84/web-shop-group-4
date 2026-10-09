"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toggleWishlistAction } from "@/app/(shop)/actions/wishlistActions";

export interface WishlistButtonProps {
  productId: number;
  productName: string;
  wishlisted: boolean;
}

export default function WishlistButton({
  productId,
  productName,
  wishlisted,
}: WishlistButtonProps) {
  const t = useTranslations("products");
  const [optimistic, setOptimistic] = useOptimistic(wishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      setOptimistic(!optimistic);
      await toggleWishlistAction(productId);
    });
  }

  const label = optimistic
    ? t("removeFromWishlist", { name: productName })
    : t("addToWishlist", { name: productName });

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={optimistic}
      aria-label={label}
      title={label}
      className="rounded-full bg-white/80 p-1.5 hover:bg-white disabled:opacity-60"
    >
      <Heart
        size="1.25rem"
        aria-hidden="true"
        className={optimistic ? "fill-red-600 text-red-600" : "text-gray-700"}
      />
    </button>
  );
}