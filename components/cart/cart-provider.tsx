"use client";

import { createContext, use, useCallback, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { addToCart, getCart, setCartQty, type CartResult } from "@/lib/cart/actions";
import type { CartView } from "@/lib/cart/logic";

const loadDrawer = () => import("./cart-drawer");
const CartDrawer = dynamic(loadDrawer, { ssr: false });

type CartContextValue = {
  cart: CartView | null;
  count: number;
  pending: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (variantId: string, opts?: { flyFrom?: HTMLElement | null; label?: string; openDrawer?: boolean }) => Promise<boolean>;
  ensureLoaded: () => void;
  setQty: (variantId: string, qty: number) => void;
  preload: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function readCountCookie() {
  const match = document.cookie.match(/(?:^|; )cart_count=(\d+)/);
  return match ? Number(match[1]) : 0;
}
const noSubscribe = () => () => {};

/** Thumbnail flies from the product image to the bag icon (transform/opacity only). */
function flyToBag(from: HTMLElement) {
  const bag = document.querySelector<HTMLElement>("[data-bag-icon]");
  if (!bag || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const ghost = from.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
    transformOrigin: "top left",
    borderRadius: "4px",
    overflow: "hidden",
  });
  document.body.appendChild(ghost);
  const scale = Math.min(28 / a.width, 28 / a.height);
  const dx = b.left + b.width / 2 - (a.left + (a.width * scale) / 2);
  const dy = b.top + b.height / 2 - (a.top + (a.height * scale) / 2);
  ghost
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.3 - 60}px) scale(${(1 + scale) / 2})`, opacity: 0.9, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2 },
      ],
      { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    )
    .finished.finally(() => ghost.remove());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  // Badge count: the cookie on first paint (no server call), then whatever the last action returned.
  const cookieCount = useSyncExternalStore(noSubscribe, readCountCookie, () => 0);
  const [actionCount, setCount] = useState<number | null>(null);
  const count = actionCount ?? cookieCount;
  const [open, setOpenState] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [pending, startTransition] = useTransition();
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((text: string, tone: "ok" | "error") => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const apply = useCallback((result: CartResult) => {
    setCart(result.cart);
    setCount(result.cart.count);
    return result;
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setDrawerMounted(true);
        if (!cart) startTransition(async () => void apply(await getCart()));
      }
      setOpenState(next);
    },
    [apply, cart]
  );

  const add = useCallback<CartContextValue["add"]>(
    async (variantId, opts) => {
      if (opts?.flyFrom) flyToBag(opts.flyFrom);
      setCount((c) => (c ?? cookieCount) + 1);
      const result = await new Promise<CartResult>((resolve) =>
        startTransition(async () => resolve(apply(await addToCart({ variantId, qty: 1 }))))
      );
      if (result.error) {
        showToast(result.error, "error");
        return false;
      }
      if (opts?.openDrawer) {
        setDrawerMounted(true);
        setOpenState(true);
      } else {
        showToast(opts?.label ? `Added ${opts.label}` : "Added to bag", "ok");
      }
      return true;
    },
    [apply, showToast, cookieCount]
  );

  const ensureLoaded = useCallback(() => {
    if (!cart) startTransition(async () => void apply(await getCart()));
  }, [apply, cart]);

  const setQty = useCallback<CartContextValue["setQty"]>(
    (variantId, qty) => {
      // Optimistic: reflect the change immediately, then reconcile with the server's view.
      setCart((current) =>
        current
          ? {
              ...current,
              lines: current.lines
                .map((l) => (l.variantId === variantId ? { ...l, qty } : l))
                .filter((l) => l.qty > 0),
            }
          : current
      );
      startTransition(async () => {
        const result = apply(await setCartQty({ variantId, qty }));
        if (result.error) showToast(result.error, "error");
      });
    },
    [apply, showToast]
  );

  return (
    <CartContext
      value={{ cart, count, pending, open, setOpen, add, setQty, ensureLoaded, preload: () => void loadDrawer() }}
    >
      {children}
      {drawerMounted && <CartDrawer />}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 sm:bottom-6 sm:justify-start sm:px-6">
        {toast && (
          <div
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5.5 py-3.5 text-[13px] text-white shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          >
            <span aria-hidden className={`size-2 rounded-full ${toast.tone === "ok" ? "bg-brand" : "bg-[#ff8a65]"}`} />
            {toast.text}
          </div>
        )}
      </div>
    </CartContext>
  );
}
