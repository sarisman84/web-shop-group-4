import CartCount from "./cart-count";

export default function ShopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <span className="text-lg font-semibold tracking-tight">
          Nordic Retail
        </span>
        <nav aria-label="Main" className="flex items-center gap-3">
          <CartCount />
        </nav>
      </div>
    </header>
  );
}
