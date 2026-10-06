import { readCart } from "@/lib/cart-cookie";
import { getProduct } from "@/lib/data";
import CartClient from "./cart-client";

export default async function CartPage() {
  const cartLines = await readCart();

  const cartItems = await Promise.all(
    cartLines.map(async (line) => {
      const product = await getProduct(line.productId);
      if (!product) return null;
      return {
        id: line.productId,
        name: product.title,
        // Yahan product ki available property (jaise brand ya sku) use karein
        variant: product.brand || product.sku || "Standard", 
        price: product.price,
        quantity: line.quantity,
        image: product.thumbnail || product.images?.[0] || "https://picsum.photos/seed/fallback/120/120",
      };
    })
  );

  const validItems = cartItems.filter((i) => i !== null);

  return <CartClient initialItems={validItems} />;
}