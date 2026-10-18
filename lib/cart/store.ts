import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/lib/db/client";
import { sign, unsign } from "@/lib/server/signing";
import type { CartItem } from "./logic";

// Cart persistence. With a database: a `carts` row keyed by a signed httpOnly `cart_token` cookie.
// Without one (static preview deploys): the items themselves live in a signed cookie.
const TOKEN_COOKIE = "cart_token";
const ITEMS_COOKIE = "cart_items";
// Readable by the client (count only) so the header badge never needs a server round trip.
const COUNT_COOKIE = "cart_count";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

const itemsSchema = z.array(z.object({ variantId: z.string().min(1).max(40), qty: z.number().int().min(1).max(99) })).max(50);

async function cartIdForToken(token: string, create: boolean) {
  if (!db) return null;
  const [found] = await db.select({ id: schema.carts.id }).from(schema.carts).where(eq(schema.carts.token, token));
  if (found || !create) return found?.id ?? null;
  const [created] = await db.insert(schema.carts).values({ token }).returning({ id: schema.carts.id });
  return created.id;
}

export async function readCartToken() {
  return unsign((await cookies()).get(TOKEN_COOKIE)?.value);
}

export async function loadItems(): Promise<CartItem[]> {
  const jar = await cookies();
  if (!db) {
    const raw = unsign(jar.get(ITEMS_COOKIE)?.value);
    if (!raw) return [];
    try {
      const parsed = itemsSchema.safeParse(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")));
      return parsed.success ? parsed.data : [];
    } catch {
      return [];
    }
  }
  const token = await readCartToken();
  if (!token) return [];
  const cartId = await cartIdForToken(token, false);
  if (!cartId) return [];
  const rows = await db
    .select({ variantId: schema.cartItems.variantId, qty: schema.cartItems.qty })
    .from(schema.cartItems)
    .where(eq(schema.cartItems.cartId, cartId))
    .orderBy(schema.cartItems.addedAt);
  return rows.map((r) => ({ variantId: String(r.variantId), qty: r.qty }));
}

export async function saveItems(items: CartItem[]) {
  const jar = await cookies();
  jar.set(COUNT_COOKIE, String(items.reduce((n, i) => n + i.qty, 0)), { ...cookieOptions, httpOnly: false });
  if (!db) {
    jar.set(ITEMS_COOKIE, sign(Buffer.from(JSON.stringify(items)).toString("base64url")), cookieOptions);
    return;
  }
  let token = await readCartToken();
  if (!token) {
    token = randomUUID();
    jar.set(TOKEN_COOKIE, sign(token), cookieOptions);
  }
  const cartId = (await cartIdForToken(token, true))!;
  await db.transaction(async (tx) => {
    const keep = new Set(items.map((i) => Number(i.variantId)));
    const existing = await tx.select({ variantId: schema.cartItems.variantId }).from(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
    for (const row of existing) {
      if (!keep.has(row.variantId)) {
        await tx.delete(schema.cartItems).where(and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.variantId, row.variantId)));
      }
    }
    for (const item of items) {
      await tx
        .insert(schema.cartItems)
        .values({ cartId, variantId: Number(item.variantId), qty: item.qty })
        .onConflictDoUpdate({ target: [schema.cartItems.cartId, schema.cartItems.variantId], set: { qty: item.qty } });
    }
    await tx.update(schema.carts).set({ updatedAt: new Date() }).where(eq(schema.carts.id, cartId));
  });
}

export async function clearCart() {
  const jar = await cookies();
  jar.delete(COUNT_COOKIE);
  if (!db) {
    jar.delete(ITEMS_COOKIE);
    return;
  }
  const token = await readCartToken();
  const cartId = token && (await cartIdForToken(token, false));
  if (cartId) await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cartId));
}
