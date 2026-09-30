import { countCartLines } from "@/lib/cart";
import { readCart } from "@/lib/cart-cookie";

export default async function CartCount() {
  const count = countCartLines(await readCart());

  return (
    <span
      className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium"
      aria-label={
        count === 0 ? "Cart, empty" : `Cart, ${count} ${count === 1 ? "item" : "items"}`
      }
    >
      Cart
      <span
        aria-hidden="true"
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-4xl bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
      >
        {count}
      </span>
    </span>
  );
}
