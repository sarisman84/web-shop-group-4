"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCartAction } from "@/app/(shop)/actions/cart-actions";
import { INITIAL_CART_ACTION_STATE } from "@/lib/cart";

interface AddToCartProps {
  productId: number;
  productTitle: string;
  stock: number;
  maxQuantity: number;
  minimumOrderQuantity?: number;
}

function toStepValue(quantity: string, fallback: number): number {
  const parsed = Number.parseInt(quantity, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default function AddToCart({
  productId,
  productTitle,
  stock,
  maxQuantity,
  minimumOrderQuantity,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(
    String(minimumOrderQuantity ?? 1),
  );
  const [state, formAction, isPending] = useActionState(
    addToCartAction,
    INITIAL_CART_ACTION_STATE,
  );

  const [isAdded, setIsAdded] = useState(false);
  const [handledState, setHandledState] = useState(state);
  const isOutOfStock = stock === 0 || maxQuantity < 1;
  const current = toStepValue(quantity, 1);
  const canDecrement = !isOutOfStock && current > 1;
  const canIncrement = !isOutOfStock && current < maxQuantity;

  if (state !== handledState) {
    setHandledState(state);

    if (state.ok) {
      setIsAdded(true);
    }
  }

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.ok) {
      toast.success(`${productTitle} added to your cart.`);
    }
  }, [state, productTitle]);

  useEffect(() => {
    if (!isAdded) return;

    const timer = setTimeout(() => setIsAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [isAdded]);

  if (isOutOfStock) {
    return (
      <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
        Currently out of stock
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canDecrement || isPending}
            onClick={() => setQuantity(String(current - 1))}
            aria-label="Decrease quantity"
          >
            <Minus aria-hidden="true" />
          </Button>

          <Input
            type="number"
            name="quantity"
            min={1}
            max={maxQuantity}
            step={1}
            inputMode="numeric"
            value={quantity}
            disabled={isPending}
            onChange={(event) => setQuantity(event.target.value)}
            aria-label={`Quantity of ${productTitle}`}
            className="w-16 text-center"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!canIncrement || isPending}
            onClick={() => setQuantity(String(current + 1))}
            aria-label="Increase quantity"
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          aria-busy={isPending}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
              Adding…
            </>
          ) : isAdded ? (
            <>
              <Check aria-hidden="true" />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingCart aria-hidden="true" />
              Add to cart
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {stock <= 10
          ? `Only ${stock} left in stock`
          : `${stock} in stock`}
        {minimumOrderQuantity !== undefined &&
          ` · minimum order ${minimumOrderQuantity}`}
      </p>
    </form>
  );
}
