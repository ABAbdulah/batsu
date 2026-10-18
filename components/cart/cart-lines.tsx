"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart-provider";

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { cart, setQty } = useCart();
  if (!cart) return null;
  const stepper = "grid size-9 place-items-center text-base disabled:opacity-30";

  return (
    <ul className="divide-y divide-line">
      {cart.lines.map((line) => (
        <li key={line.variantId} className="flex gap-4 py-5">
          <Link href={`/products/${line.handle}`} onClick={onNavigate} className="relative block aspect-4/5 w-20 shrink-0 overflow-hidden bg-stone">
            {line.image && <Image src={line.image.src} alt={line.image.alt} fill sizes="96px" className="object-cover" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <Link href={`/products/${line.handle}`} onClick={onNavigate} className="truncate text-sm font-medium hover:text-brand">
                {line.title}
              </Link>
              <span className="text-[13px] whitespace-nowrap">{formatPrice(line.price * line.qty)}</span>
            </div>
            <span className="text-xs text-mute">Size {line.size}</span>
            {line.adjusted && <span className="text-xs text-destructive">Reduced to what&apos;s in stock.</span>}
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center rounded-full border border-line-strong" role="group" aria-label={`Quantity of ${line.title}, size ${line.size}`}>
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(line.variantId, line.qty - 1)} className={stepper}>
                  −
                </button>
                <span className="w-6 text-center text-[13px] tabular-nums" aria-live="polite">
                  {line.qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={line.qty >= line.maxQty}
                  onClick={() => setQty(line.variantId, line.qty + 1)}
                  className={stepper}
                >
                  +
                </button>
              </div>
              <button type="button" onClick={() => setQty(line.variantId, 0)} className="min-h-11 text-xs text-mute underline underline-offset-4 hover:text-ink">
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
