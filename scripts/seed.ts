// Seed the database from the Shopify snapshot (lib/data/catalog.json) plus myth lines and store
// settings. Idempotent: re-running updates rows by handle/sku and never touches orders.
// Usage: npm run db:seed   (needs DATABASE_URL)
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import catalog from "../lib/data/catalog.json" with { type: "json" };
import { collectionCopy, collectionOrder } from "../lib/data/collection-copy";
import { myths } from "../lib/data/myths";
import * as schema from "../lib/db/schema";
import { defaultSettings } from "../lib/settings-defaults";

// Shopify's public JSON only says in/out of stock. PLACEHOLDER: real counts come from the
// Shopify admin export or the Phase 2 admin.
const SEED_STOCK = 10;

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema });

await db.transaction(async (tx) => {
  const collectionIds = new Map<string, number>();
  for (const c of catalog.collections) {
    const copy = collectionCopy[c.handle];
    const values = {
      handle: c.handle,
      title: copy?.title ?? c.handle,
      navLabel: copy?.navLabel ?? null,
      tagline: copy?.tagline ?? null,
      description: copy?.intro ?? null,
      heroImage: c.image ?? null,
      feature: copy?.feature ?? null,
      sortOrder: collectionOrder.indexOf(c.handle),
    };
    const [row] = await tx
      .insert(schema.collections)
      .values(values)
      .onConflictDoUpdate({ target: schema.collections.handle, set: values })
      .returning({ id: schema.collections.id });
    collectionIds.set(c.handle, row.id);
  }

  for (const p of catalog.products) {
    const myth = myths[p.handle];
    const values = {
      handle: p.handle,
      title: p.title,
      mythLine: myth?.line ?? null,
      mythShort: myth?.short ?? null,
      description: p.description,
      details: p.details,
      fitNote: "fitNote" in p ? (p.fitNote as string) : null,
      sizeChart: "sizeChart" in p ? (p.sizeChart as schema.ImageJson) : null,
      pricePkr: p.price,
      compareAtPkr: "compareAtPrice" in p ? (p.compareAtPrice as number) : null,
      status: "active" as const,
      createdAt: new Date(p.createdAt),
    };
    const [row] = await tx
      .insert(schema.products)
      .values(values)
      .onConflictDoUpdate({ target: schema.products.handle, set: values })
      .returning({ id: schema.products.id });

    await tx.delete(schema.productImages).where(sql`${schema.productImages.productId} = ${row.id}`);
    if (p.images.length) {
      await tx.insert(schema.productImages).values(
        p.images.map((img, position) => ({
          productId: row.id,
          url: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
          position,
        }))
      );
    }

    for (const [position, v] of p.sizes.entries()) {
      const variant = {
        productId: row.id,
        size: v.size,
        sku: `${p.handle}-${v.size}`.toUpperCase(),
        stock: v.available ? SEED_STOCK : 0,
        position,
      };
      await tx
        .insert(schema.variants)
        .values(variant)
        .onConflictDoUpdate({ target: schema.variants.sku, set: { size: variant.size, position } });
    }

    await tx.delete(schema.productCollections).where(sql`${schema.productCollections.productId} = ${row.id}`);
    for (const handle of p.collections) {
      const collectionId = collectionIds.get(handle);
      const position = catalog.collections.find((c) => c.handle === handle)!.products.indexOf(p.handle);
      if (collectionId) await tx.insert(schema.productCollections).values({ productId: row.id, collectionId, position });
    }
  }

  // Settings are only inserted, never overwritten, so admin edits survive a re-seed.
  for (const [key, value] of Object.entries(defaultSettings)) {
    await tx.insert(schema.settings).values({ key, value }).onConflictDoNothing();
  }
});

const counts = await db.execute(sql`
  select (select count(*) from products) as products, (select count(*) from variants) as variants,
         (select count(*) from product_images) as images, (select count(*) from collections) as collections`);
console.log("Seeded:", counts.rows[0]);
await pool.end();
