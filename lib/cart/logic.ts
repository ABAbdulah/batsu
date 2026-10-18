// Pure cart + pricing logic (no I/O) so it can be unit-tested. Prices are integer PKR and are only
// ever computed here on the server from catalogue data, never from client-sent totals.
import type { Product } from "@/lib/data/types";
import type { ShippingSettings } from "@/lib/settings-defaults";

export const MAX_QTY_PER_LINE = 10;

export type CartItem = { variantId: string; qty: number };

export type CartLine = {
  variantId: string;
  handle: string;
  title: string;
  size: string;
  price: number;
  image?: { src: string; alt: string };
  qty: number;
  /** Most the shopper can have of this variant right now. */
  maxQty: number;
  /** The requested qty was cut down to what's in stock. */
  adjusted?: boolean;
};

export type CartView = {
  lines: CartLine[];
  count: number;
  subtotal: number;
};

export type Totals = { subtotal: number; shippingFee: number; discount: number; total: number };

export function findVariant(products: Product[], variantId: string) {
  for (const product of products) {
    const variant = product.sizes.find((s) => s.variantId === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

/** Units of a variant that can be added; static data without counts allows up to the line max. */
export function availableQty(variant: { available: boolean; stock?: number }) {
  if (!variant.available) return 0;
  return Math.min(variant.stock ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
}

/** Merge or set a line, clamped to stock. qty <= 0 removes it. */
export function upsertItem(items: CartItem[], variantId: string, qty: number, mode: "add" | "set"): CartItem[] {
  const existing = items.find((i) => i.variantId === variantId);
  const nextQty = mode === "add" ? (existing?.qty ?? 0) + qty : qty;
  const rest = items.filter((i) => i.variantId !== variantId);
  if (nextQty <= 0) return rest;
  const line = { variantId, qty: Math.min(nextQty, MAX_QTY_PER_LINE) };
  return existing ? items.map((i) => (i.variantId === variantId ? line : i)) : [...rest, line];
}

/** Combine a guest cart into a signed-in user's cart (on login). */
export function mergeItems(target: CartItem[], incoming: CartItem[]): CartItem[] {
  return incoming.reduce((acc, item) => upsertItem(acc, item.variantId, item.qty, "add"), target);
}

/** Resolve items against the catalogue: drops unknown variants, clamps to stock. */
export function buildCartView(items: CartItem[], products: Product[]): CartView {
  const lines: CartLine[] = [];
  for (const item of items) {
    const found = findVariant(products, item.variantId);
    if (!found) continue;
    const maxQty = availableQty(found.variant);
    if (maxQty === 0) continue;
    const qty = Math.min(item.qty, maxQty);
    const image = found.product.images[0];
    lines.push({
      variantId: item.variantId,
      handle: found.product.handle,
      title: found.product.title,
      size: found.variant.size,
      price: found.product.price,
      image: image ? { src: image.src, alt: image.alt } : undefined,
      qty,
      maxQty,
      ...(qty < item.qty ? { adjusted: true } : {}),
    });
  }
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.price * l.qty, 0),
  };
}

export function shippingFor(subtotal: number, shipping: ShippingSettings): number {
  if (subtotal === 0) return 0;
  if (shipping.freeShippingOver !== null && subtotal >= shipping.freeShippingOver) return 0;
  return shipping.flatFee;
}

export function computeTotals(subtotal: number, shipping: ShippingSettings, discount = 0): Totals {
  const shippingFee = shippingFor(subtotal, shipping);
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  return { subtotal, shippingFee, discount: safeDiscount, total: subtotal - safeDiscount + shippingFee };
}
