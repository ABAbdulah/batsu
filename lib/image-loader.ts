"use client";

import type { ImageLoaderProps } from "next/image";

// Product photos are resized by the Shopify CDN (WebP, 1-year cache), so they cost nothing on
// Vercel. Quality 70 roughly halves file size versus Shopify's default with no visible loss.
// Keep in sync with scripts/warm-images.mjs. Swap for Blob + Vercel optimisation when images move.
export const DEFAULT_QUALITY = 70;

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality ?? DEFAULT_QUALITY));
    return url.toString();
  }
  return src;
}
