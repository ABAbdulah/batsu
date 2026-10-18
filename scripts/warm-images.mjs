// Pre-warm Shopify's image CDN: request every catalogue photo at every width next/image can ask
// for, so shoppers never wait on a first-time resize (1–2.5 s cold vs ~0.3 s cached).
// Run after a catalogue sync or a deploy that changes image sizes: npm run warm:images
import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../lib/data/catalog.json", import.meta.url), "utf8"));
const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
const list = (key) => [...config.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`))[1].matchAll(/\d+/g)].map(Number);
const widths = [...new Set([...list("imageSizes"), ...list("deviceSizes")])].sort((a, b) => a - b);

// Same URL shape as lib/image-loader.ts, so the warmed cache entries are the ones pages request.
const urlFor = (src, width) => {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", "70"); // DEFAULT_QUALITY in lib/image-loader.ts
  return url.toString();
};

const sources = [
  ...catalog.products.flatMap((p) => p.images.map((i) => i.src)),
  ...catalog.collections.map((c) => c.image?.src).filter(Boolean),
];
const jobs = sources.flatMap((src) => widths.map((w) => urlFor(src, w)));
// Chrome/Edge/Firefox ask for AVIF/WebP; Safari for WebP. Shopify serves WebP to both.
const ACCEPT = "image/avif,image/webp,image/apng,image/*,*/*;q=0.8";

let done = 0;
let slow = 0;
const started = Date.now();
async function worker() {
  while (jobs.length) {
    const url = jobs.shift();
    const t = Date.now();
    const res = await fetch(url, { headers: { accept: ACCEPT } }).catch(() => null);
    // Time to headers = Shopify's resize/cache time; body download depends on our own bandwidth.
    if (Date.now() - t > 800) slow++;
    await res?.arrayBuffer();
    done++;
  }
}
console.log(`Warming ${sources.length} images × ${widths.length} widths (${widths.join(", ")})…`);
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`Done: ${done} requests in ${((Date.now() - started) / 1000).toFixed(0)}s, ${slow} took >0.8 s to first byte (cold resizes, now cached).`);
