"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";

export default function CartDrawer() {
  const { cart, open, setOpen, pending } = useCart();
  const close = () => setOpen(false);
  const empty = cart && cart.lines.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[min(440px,92vw)]">
        <div className="flex h-15 shrink-0 items-center border-b border-line px-6">
          <SheetTitle>
            Your bag{cart ? ` (${cart.count})` : ""}
          </SheetTitle>
        </div>
        <div className="flex-1 overflow-y-auto px-6" aria-busy={pending}>
          {!cart && <p className="py-10 text-center text-sm text-mute">Loading your bag…</p>}
          {empty && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-serif text-2xl italic">Your bag is empty.</p>
              <Link href="/collections/all" onClick={close} className={buttonVariants({ size: "sm" })}>
                Shop all pieces
              </Link>
            </div>
          )}
          <CartLines onNavigate={close} />
        </div>
        {cart && cart.lines.length > 0 && (
          <div className="flex shrink-0 flex-col gap-3 border-t border-line px-6 pt-5 pb-6">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="text-base">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-mute">Tax included. Shipping calculated at checkout.</p>
            <Link href="/checkout" onClick={close} className={buttonVariants({ className: "w-full" })}>
              Checkout · {formatPrice(cart.subtotal)}
            </Link>
            <Link href="/cart" onClick={close} className="text-center text-xs underline underline-offset-4">
              View bag
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
