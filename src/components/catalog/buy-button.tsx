"use client";

import { useActionState, useEffect } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { addToCartAction } from "@/app/(shop)/actions/cart-actions";
import { INITIAL_CART_ACTION_STATE } from "@/lib/cart";

interface BuyButtonProps {
  productId: number;
  productName: string;
  // Undefined means the stock is unknown; the server re-checks it anyway.
  stock?: number;
  minimumOrderQuantity?: number;
}

/**
 * The card's "Köp" button: adds the product to the cart in place. It adds the
 * product's minimum order quantity (1 when it has none), the server enforces
 * the same rule. `relative z-10` keeps it above the card's stretched link.
 */
export default function BuyButton({
  productId,
  productName,
  stock,
  minimumOrderQuantity,
}: BuyButtonProps) {
  const t = useTranslations("products");
  const tDetail = useTranslations("productDetail");
  const [state, formAction, isPending] = useActionState(
    addToCartAction,
    INITIAL_CART_ACTION_STATE,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.isOk) {
      toast.success(tDetail("addedToast", { title: productName }));
    }
  }, [state, productName, tDetail]);

  const isSoldOut = stock !== undefined && stock <= 0;

  return (
    <form action={formAction} className="relative z-10">
      <input type="hidden" name="productId" value={productId} />
      <input
        type="hidden"
        name="quantity"
        value={Math.max(minimumOrderQuantity ?? 1, 1)}
      />
      <button
        type="submit"
        className="cta-button disabled:opacity-60"
        disabled={isPending || isSoldOut}
        aria-label={`${t("buy")}: ${productName}`}
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <ShoppingCart size={16} aria-hidden="true" />
        )}
        <span>{isSoldOut ? t("soldOut") : t("buy")}</span>
      </button>
    </form>
  );
}
