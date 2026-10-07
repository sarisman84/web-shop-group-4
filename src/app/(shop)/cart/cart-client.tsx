"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { X, Plus, Minus, ArrowLeft, Trash2 } from "lucide-react";
import { updateQuantityAction, removeFromCartAction, clearCartAction } from "@/app/(shop)/actions/cart-actions";

interface CartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartClient({ initialItems }: { initialItems: CartItem[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const updateQuantity = (productId: number, quantity: number) => {
    startTransition(async () => {
      if (quantity <= 0) {
        const formData = new FormData();
        formData.set("productId", String(productId));
        await removeFromCartAction({ isOk: false, error: null, count: 0 }, formData);
        setCartItems((items) => items.filter((item) => item.id !== productId));
      } else {
        const formData = new FormData();
        formData.set("productId", String(productId));
        formData.set("quantity", String(quantity));
        await updateQuantityAction({ isOk: false, error: null, count: 0 }, formData);
        setCartItems((items) =>
          items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    });
  };

  const clearCart = () => {
    startTransition(async () => {
      await clearCartAction();
      setCartItems([]);
    });
  };

  const removeItem = (productId: number) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", String(productId));
      await removeFromCartAction({ isOk: false, error: null, count: 0 }, formData);
      setCartItems((items) => items.filter((item) => item.id !== productId));
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShipping = subtotal >= 499;
  const shippingCost = freeShipping ? 0 : 49;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Varukorg ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </h1>
          <Link
            href="/"
            aria-label="Stäng varukorg"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        {/* Free shipping banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-gray-100 px-4 py-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-xs" aria-hidden="true">
            ✓
          </span>
          <p className="text-sm text-black">
            {freeShipping
              ? "Du har fri frakt på den här ordern!"
              : `Lägg till produkter för ${Math.ceil(499 - subtotal)} kr till för att få fri frakt (köp över 499 kr).`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-6">Din varukorg är tom.</p>
            <Link
              href="/products"
              className="inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Börja handla
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-gray-200 p-4"
                >
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.variant}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString("sv-SE")} kr
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            {item.price} kr / st
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isPending}
                          aria-label={`Minska antal ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isPending}
                          aria-label={`Öka antal ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isPending}
                        className="text-sm text-gray-500 hover:text-red-500 hover:underline disabled:opacity-50"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Frakt</span>
                <span className="text-gray-900">
                  {freeShipping ? "Fri frakt" : `${shippingCost} kr`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Totalt</span>
                <span className="text-lg font-bold text-gray-900">
                  {total.toLocaleString("sv-SE")} kr
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Inkl. moms. Rabattkod kan anges i kassan.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link
                href="/checkout"
                className="block w-full rounded-full bg-black py-4 text-center text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Till kassan
              </Link>
              <button
                onClick={clearCart}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-300 py-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Töm varukorg
              </button>
              <Link
                href="/"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 py-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Fortsätt handla
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
