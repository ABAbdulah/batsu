import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Shopify's CDN resizes product photos, so Vercel Image Optimization is never billed.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Few widths on purpose: every width is a separate resize + cache entry on Shopify's CDN, and
    // a first request for an uncached width takes 1–2.5 s. scripts/warm-images.mjs pre-warms these.
    deviceSizes: [480, 828, 1200, 1600],
    imageSizes: [96, 256],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
