"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { getAllProducts } from "@/lib/db/queries";
import { buildCartView, findVariant, upsertItem, type CartView } from "./logic";
import { loadItems, saveItems } from "./store";

export type CartResult = { cart: CartView; error?: string };

const variantId = z.string().regex(/^\d{1,20}$/);
const changeSchema = z.object({ variantId, qty: z.number().int().min(0).max(99) });

/** Live stock from the database so adds are checked against the current count, not the cache. */
async function liveStock(id: string) {
  if (!db) return undefined;
  const [row] = await db.select({ stock: schema.variants.stock }).from(schema.variants).where(eq(schema.variants.id, Number(id)));
  return row?.stock ?? 0;
}

async function view(items: Awaited<ReturnType<typeof loadItems>>) {
  return buildCartView(items, await getAllProducts());
}

export async function getCart(): Promise<CartResult> {
  return { cart: await view(await loadItems()) };
}

async function change(input: unknown, mode: "add" | "set"): Promise<CartResult> {
  const parsed = changeSchema.safeParse(input);
  const items = await loadItems();
  if (!parsed.success) return { cart: await view(items), error: "That size couldn't be updated." };

  const { variantId: id, qty } = parsed.data;
  const products = await getAllProducts();
  const found = findVariant(products, id);
  if (!found) return { cart: await view(items), error: "That piece is no longer available." };

  const current = items.find((i) => i.variantId === id)?.qty ?? 0;
  const wanted = mode === "add" ? current + qty : qty;
  const stock = (await liveStock(id)) ?? (found.variant.available ? Infinity : 0);
  if (wanted > 0 && stock === 0) return { cart: await view(items), error: `${found.product.title} in ${found.variant.size} is sold out.` };

  const next = upsertItem(items, id, Math.min(wanted, stock), "set");
  await saveItems(next);
  const cart = buildCartView(next, products);
  const error = wanted > stock ? `Only ${stock} left in ${found.variant.size}.` : undefined;
  return { cart, error };
}

export async function addToCart(input: { variantId: string; qty: number }) {
  return change(input, "add");
}

export async function setCartQty(input: { variantId: string; qty: number }) {
  return change(input, "set");
}
