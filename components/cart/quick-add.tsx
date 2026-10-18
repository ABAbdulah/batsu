"use client";

import type { ProductSize } from "@/lib/data/types";
import { useCart } from "./cart-provider";

// Slide-up size bar on product cards (hover or keyboard focus; hidden on touch screens, where a
// tap opens the product page). The nearest card image flies to the bag on add.
export function QuickAdd({ title, sizes }: { title: string; sizes: ProductSize[] }) {
  const { add } = useCart();
  return (
    <div className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-[calc(100%+12px)] items-center justify-between gap-2 bg-white px-3.5 py-3 transition-transform duration-450 ease-editorial group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transition-none [@media(hover:hover)]:flex">
      <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase">Quick add</span>
      <span className="flex gap-1.5">
        {sizes.map((s) => (
          <button
            key={s.variantId}
            type="button"
            disabled={!s.available}
            aria-label={s.available ? `Add ${title} in ${s.size}` : `${s.size} sold out`}
            onClick={(event) => {
              const card = event.currentTarget.closest("[data-card]");
              void add(s.variantId, { flyFrom: card?.querySelector("img"), label: `${title} — ${s.size}` });
            }}
            className="grid size-8.5 place-items-center rounded-full border border-ink text-[11.5px] transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-[#e2e2e0] disabled:text-[#b5b5b5] disabled:line-through disabled:hover:bg-white"
          >
            {s.size}
          </button>
        ))}
      </span>
    </div>
  );
}
