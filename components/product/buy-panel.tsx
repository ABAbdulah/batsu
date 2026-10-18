"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button-variants";
import type { ProductSize } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";

const LOW_STOCK = 3;

export function BuyPanel({
  title,
  price,
  sizes,
  sizeGuide,
}: {
  title: string;
  price: number;
  sizes: ProductSize[];
  sizeGuide?: React.ReactNode;
}) {
  const id = useId();
  const { add, pending } = useCart();
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const choice = sizes.find((s) => s.variantId === selected);
  const soldOut = sizes.every((s) => !s.available);
  const allInStock = sizes.every((s) => s.available);

  function pick(index: number) {
    const size = sizes[index];
    if (!size?.available) return;
    setSelected(size.variantId);
    setHint(false);
  }

  // Radio-group keyboard pattern: arrows move between in-stock sizes.
  function onKey(event: KeyboardEvent, index: number) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    for (let n = 1; n <= sizes.length; n++) {
      const next = (index + step * n + sizes.length) % sizes.length;
      if (sizes[next].available) {
        pick(next);
        radios.current[next]?.focus();
        return;
      }
    }
  }

  async function onAdd() {
    if (!choice) {
      setHint(true);
      radios.current[sizes.findIndex((s) => s.available)]?.focus();
      return;
    }
    const image = document.querySelector<HTMLElement>("[data-product-gallery] img");
    await add(choice.variantId, { flyFrom: image, label: `${title} — ${choice.size}`, openDrawer: true });
  }

  const focusable = selected ?? sizes.find((s) => s.available)?.variantId;
  const stockNote =
    choice?.stock !== undefined && choice.stock <= LOW_STOCK ? `Only ${choice.stock} left in ${choice.size}` : null;

  return (
    <div className="flex flex-col gap-6.5">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span id={`${id}-label`} className="text-[11px] font-medium tracking-[0.2em] uppercase">
            Size — <span className="font-normal tracking-[0.06em] normal-case">{choice?.size ?? "Select"}</span>
          </span>
          {sizeGuide}
        </div>
        <div role="radiogroup" aria-labelledby={`${id}-label`} className={`grid gap-2 ${sizes.length >= 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {sizes.map((s, i) => {
            const checked = s.variantId === selected;
            return (
              <button
                key={s.variantId}
                ref={(el) => {
                  radios.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={!s.available}
                aria-label={s.available ? s.size : `${s.size}, sold out`}
                tabIndex={s.variantId === focusable ? 0 : -1}
                onClick={() => pick(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`h-13 rounded-full border text-[13px] transition-colors duration-250 active:scale-[0.97] motion-reduce:transition-none ${
                  checked
                    ? "border-ink bg-ink text-white"
                    : s.available
                      ? "border-line-strong bg-white hover:border-ink"
                      : "cursor-not-allowed border-line text-[#b5b5b5] line-through"
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>
        {hint && (
          <span role="alert" className="text-[13px] text-destructive">
            Choose a size to continue.
          </span>
        )}
        {stockNote && <span className="text-[13px] text-brand">{stockNote}</span>}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut || pending}
          className={buttonVariants({ className: "h-14.5 w-full text-xs tracking-[0.18em]" })}
        >
          {soldOut ? "Sold out" : choice ? `Add to bag · ${formatPrice(price)}` : "Select a size"}
        </button>
        <span className="text-center text-[12.5px] text-mute">
          {soldOut ? "This piece is sold out." : allInStock ? "All sizes in stock · Tax included" : "Tax included"}
        </span>
      </div>
    </div>
  );
}
