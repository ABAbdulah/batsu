import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Shopify's CDN resizes product photos, so Vercel Image Optimization is never billed.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [360, 480, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
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
