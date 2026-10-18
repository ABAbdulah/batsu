"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatPrice } from "@/lib/format";
import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";

export function CartPageView() {
  const { cart, ensureLoaded } = useCart();
  useEffect(ensureLoaded, [ensureLoaded]);

  if (!cart) return <p className="py-16 text-sm text-mute">Loading your bag…</p>;
  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5 py-12">
        <p className="font-serif text-2xl italic">Your bag is empty.</p>
        <Link href="/collections/all" className={buttonVariants()}>
          Shop all pieces
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
      <CartLines />
      <aside className="flex h-fit flex-col gap-4 bg-paper p-6 lg:sticky lg:top-6">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Subtotal</span>
          <span className="text-lg">{formatPrice(cart.subtotal)}</span>
        </div>
        <p className="text-xs text-mute">Tax included. Shipping calculated at checkout.</p>
        <Link href="/checkout" className={buttonVariants({ className: "w-full" })}>
          Checkout · {formatPrice(cart.subtotal)}
        </Link>
      </aside>
    </div>
  );
}
