// Snapshot the live Shopify catalogue into lib/data/catalog.json.
// Temporary data source until the Neon database lands; run with `npm run sync:shopify`.
import { writeFile } from "node:fs/promises";

const STORE = "https://www.batsuofficial.com";
const COLLECTION_HANDLES = [
  "modern-myths",
  "summer-vol3",
  "summer-vol-2",
  "summer-collection-oversize-shirt-streetwear",
  "winter-collection-streetwear",
  "t-shirts",
];
const MAX_IMAGE_WIDTH = 2000;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_ALIASES = {
  xs: "XS",
  s: "S",
  small: "S",
  m: "M",
  medium: "M",
  l: "L",
  large: "L",
  xl: "XL",
  "x-large": "XL",
  xxl: "XXL",
};
// Spec lines that duplicate data we already show elsewhere.
const SKIPPED_DETAILS = new Set(["size", "product description"]);

async function getJson(path, attempt = 1) {
  const res = await fetch(`${STORE}${path}`, { headers: { accept: "application/json" } });
  // Shopify rate-limits the public JSON endpoints; back off and retry.
  if (res.status === 429 && attempt <= 5) {
    await new Promise((r) => setTimeout(r, 2000 * attempt));
    return getJson(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html) {
  return decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function parseBody(html) {
  const description = [];
  const details = [];
  let fitNote;
  for (const raw of html.split(/<\/p>/i)) {
    const label = raw.match(/<strong>([^<]*)<\/strong>/i);
    if (label) {
      const key = stripTags(label[1]).replace(/[:;]\s*$/, "").trim();
      const value = stripTags(raw.slice(raw.indexOf(label[0]) + label[0].length)).replace(/^[:;]\s*/, "");
      if (!SKIPPED_DETAILS.has(key.toLowerCase()) && value) details.push({ label: key, value });
      continue;
    }
    for (const chunk of raw.split(/(?:<br\s*\/?>\s*){2,}/i)) {
      const text = stripTags(chunk);
      if (!text) continue;
      if (/^model is wearing/i.test(text)) fitNote = text;
      else description.push(text);
    }
  }
  return { description, details, fitNote };
}

function imageUrl(src, width) {
  const url = new URL(src);
  if (width > MAX_IMAGE_WIDTH) url.searchParams.set("width", String(MAX_IMAGE_WIDTH));
  return url.toString();
}

function toProduct(p, collectionsByProduct) {
  const title = p.title.replace(/\s+-\s+/g, "-");
  const sizes = p.variants
    .map((v) => ({
      variantId: String(v.id),
      size: SIZE_ALIASES[v.option1.trim().toLowerCase()] ?? v.option1.trim(),
      available: v.available,
    }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  const price = Math.round(Number(p.variants[0].price));
  const compareAt = Number(p.variants[0].compare_at_price ?? 0);
  return {
    handle: p.handle,
    title,
    price,
    ...(compareAt > price ? { compareAtPrice: Math.round(compareAt) } : {}),
    ...parseBody(p.body_html ?? ""),
    sizes,
    images: p.images.map((img, i) => {
      const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
      return {
        src: imageUrl(img.src, img.width),
        width: Math.round(img.width * scale),
        height: Math.round(img.height * scale),
        alt: img.alt || `${title}, image ${i + 1}`,
      };
    }),
    collections: collectionsByProduct.get(p.handle) ?? [],
    createdAt: p.created_at,
  };
}

const { products } = await getJson("/products.json?limit=250");
const collectionsByProduct = new Map();
const collections = [];
for (const handle of COLLECTION_HANDLES) {
  const { products: items } = await getJson(`/collections/${handle}/products.json?limit=250`);
  if (items.length === 0) throw new Error(`Collection "${handle}" is empty or missing`);
  collections.push({ handle, products: items.map((p) => p.handle) });
  for (const p of items) {
    collectionsByProduct.set(p.handle, [...(collectionsByProduct.get(p.handle) ?? []), handle]);
  }
}

const catalog = {
  syncedAt: new Date().toISOString(),
  collections,
  products: products.map((p) => toProduct(p, collectionsByProduct)),
};
await writeFile(new URL("../lib/data/catalog.json", import.meta.url), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Synced ${catalog.products.length} products, ${collections.length} collections`);
