import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import * as staticData from "@/lib/data";
import type { Collection, Product, Size } from "@/lib/data/types";
import { defaultSettings, type SettingsMap } from "@/lib/settings-defaults";
import { db, schema } from "./client";

export const CATALOG_TAG = "catalog";
export const SETTINGS_TAG = "settings";

type Catalog = { products: Product[]; collections: Collection[] };

/**
 * The whole catalogue in one cached read (it's ~30 products). Pages are prerendered from it and
 * stay static; anything that changes products or stock calls revalidateTag(CATALOG_TAG).
 * Without DATABASE_URL it serves the static Shopify snapshot.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("max");
  if (!db) return { products: staticData.getAllProducts(), collections: staticData.getCollections() };

  const [productRows, imageRows, variantRows, collectionRows, linkRows] = await Promise.all([
    db.select().from(schema.products).where(eq(schema.products.status, "active")).orderBy(asc(schema.products.id)),
    db.select().from(schema.productImages).orderBy(asc(schema.productImages.position)),
    db.select().from(schema.variants).orderBy(asc(schema.variants.position)),
    db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.isPublished, true))
      .orderBy(asc(schema.collections.sortOrder)),
    db.select().from(schema.productCollections).orderBy(asc(schema.productCollections.position)),
  ]);

  const handleById = new Map(productRows.map((p) => [p.id, p.handle]));
  const collectionHandleById = new Map(collectionRows.map((c) => [c.id, c.handle]));

  const products: Product[] = productRows.map((p) => ({
    handle: p.handle,
    title: p.title,
    price: p.pricePkr,
    ...(p.compareAtPkr && p.compareAtPkr > p.pricePkr ? { compareAtPrice: p.compareAtPkr } : {}),
    mythLine: p.mythLine ?? undefined,
    mythShort: p.mythShort ?? undefined,
    description: p.description,
    details: p.details,
    fitNote: p.fitNote ?? undefined,
    sizeChart: p.sizeChart ?? undefined,
    sizes: variantRows
      .filter((v) => v.productId === p.id)
      .map((v) => ({ variantId: String(v.id), size: v.size as Size, available: v.stock > 0, stock: v.stock })),
    images: imageRows
      .filter((i) => i.productId === p.id)
      .map((i) => ({ src: i.url, width: i.width, height: i.height, alt: i.alt, blurDataUrl: i.blurDataUrl ?? undefined })),
    collections: linkRows
      .filter((l) => l.productId === p.id)
      .map((l) => collectionHandleById.get(l.collectionId))
      .filter((h): h is string => !!h),
    createdAt: p.createdAt.toISOString(),
  }));

  const collections: Collection[] = collectionRows.map((c) => ({
    handle: c.handle,
    title: c.title,
    navLabel: c.navLabel ?? undefined,
    tagline: c.tagline ?? undefined,
    intro: c.description ?? undefined,
    image: c.heroImage ?? undefined,
    feature: c.feature ?? undefined,
    productHandles: linkRows
      .filter((l) => l.collectionId === c.id && handleById.has(l.productId))
      .map((l) => handleById.get(l.productId)!),
  }));

  return { products, collections };
}

export async function getProduct(handle: string) {
  return (await getCatalog()).products.find((p) => p.handle === handle);
}

export async function getProducts(handles: readonly string[]) {
  const { products } = await getCatalog();
  return handles.map((h) => products.find((p) => p.handle === h)).filter((p): p is Product => !!p);
}

export async function getAllProducts() {
  return (await getCatalog()).products;
}

export async function getCollections() {
  return (await getCatalog()).collections;
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  const { collections, products } = await getCatalog();
  if (handle === "all") {
    return { handle: "all", title: "All Products", tagline: "Every piece, every myth.", productHandles: products.map((p) => p.handle) };
  }
  return collections.find((c) => c.handle === handle);
}

export async function getCollectionProducts(handle: string) {
  const collection = await getCollection(handle);
  return collection ? getProducts(collection.productHandles) : [];
}

/** Pieces from the same collections, for "Wear it with". */
export async function getRelatedProducts(product: Product, limit = 3) {
  const { products } = await getCatalog();
  const related = products.filter(
    (p) => p.handle !== product.handle && p.collections.some((c) => product.collections.includes(c)) && p.images.length
  );
  return related.slice(0, limit);
}

export async function getSettings(): Promise<SettingsMap> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");
  if (!db) return defaultSettings;
  const rows = await db.select().from(schema.settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<SettingsMap>;
  return {
    store: { ...defaultSettings.store, ...stored.store },
    shipping: { ...defaultSettings.shipping, ...stored.shipping },
    drop: { ...defaultSettings.drop, ...stored.drop },
    hero: { ...defaultSettings.hero, ...stored.hero },
  };
}
