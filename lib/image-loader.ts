"use client";

import type { ImageLoaderProps } from "next/image";

// Product photos are resized by the Shopify CDN (WebP, 1-year cache), so they cost nothing on
// Vercel. Swap this for Blob + Vercel optimisation when the images move.
export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("https://cdn.shopify.com/")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  return src;
}
