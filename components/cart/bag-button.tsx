"use client";

import { BagIcon } from "@/components/icons";
import { useCart } from "./cart-provider";

export function BagButton() {
  const { count, setOpen, preload } = useCart();
  return (
    <button
      type="button"
      aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      onClick={() => setOpen(true)}
      onPointerEnter={preload}
      onFocus={preload}
      className="relative grid size-11 place-items-center"
    >
      <BagIcon data-bag-icon className="size-5 lg:size-4.75" />
      <span
        key={count}
        className={`absolute top-1.5 right-1.25 grid h-3.75 min-w-3.75 place-items-center rounded-full px-1 text-[9px] text-white motion-safe:animate-[bag-bounce_0.45s_var(--ease-editorial)] ${count ? "bg-brand" : "bg-ink"}`}
      >
        {count}
      </span>
    </button>
  );
}
