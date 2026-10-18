import catalog from "./catalog.json";
import { myths } from "./myths";
import type { Collection, Product } from "./types";

export type * from "./types";

// Editorial copy per collection. Handles match the Shopify store so URLs survive the move.
const collectionCopy: Record<string, Pick<Collection, "title" | "navLabel" | "tagline" | "intro" | "feature">> = {
  "summer-vol3": { title: "New In", tagline: "The newest pieces." },
  "modern-myths": {
    title: "Modern Myths 25'",
    tagline: "Four pieces. Four myths.",
    intro:
      "Cultural craftsmanship through modern form. Each piece carries quiet detail, from delicate embroidery and mirror accents to tactile stitched surfaces on twill and silk.",
  },
  "summer-vol-2": {
    title: "Summer Vol'2",
    tagline: "Louder days, brighter nights.",
    intro:
      "Hand-painted motifs, pleats in warm abstract tones and sun-faded tie-dye — six short-sleeve shirts made for the heat.",
    feature: {
      productHandle: "untitled-apr20_17-01",
      imageIndex: 2,
      text: "Hand-painted motifs,",
      emphasis: "sun-washed dye,",
      rest: "pleats that catch the light.",
    },
  },
  "summer-collection-oversize-shirt-streetwear": { title: "Summer Vol'1" },
  "winter-collection-streetwear": { title: "Winter Vol'1" },
  "t-shirts": { title: "T-Shirts", navLabel: "Tees", tagline: "Fresh tees are here." },
};

const products: Product[] = catalog.products.map((p) => ({
  ...(p as Omit<Product, "mythLine" | "mythShort">),
  mythLine: myths[p.handle]?.line,
  mythShort: myths[p.handle]?.short,
}));
const productsByHandle = new Map(products.map((p) => [p.handle, p]));

const collections: Collection[] = catalog.collections.map((c) => ({
  handle: c.handle,
  productHandles: c.products,
  image: c.image,
  ...collectionCopy[c.handle],
}));

export function getProduct(handle: string): Product | undefined {
  return productsByHandle.get(handle);
}

export function getProducts(handles: readonly string[]): Product[] {
  return handles.map((h) => productsByHandle.get(h)).filter((p): p is Product => !!p);
}

export function getAllProducts(): Product[] {
  return products;
}

const allProducts: Collection = {
  handle: "all",
  title: "All Products",
  tagline: "Every piece, every myth.",
  productHandles: products.map((p) => p.handle),
};

export function getCollection(handle: string): Collection | undefined {
  if (handle === "all") return allProducts;
  return collections.find((c) => c.handle === handle);
}

export function getCollections(): Collection[] {
  return collections;
}

export function getCollectionProducts(handle: string): Product[] {
  return getProducts(getCollection(handle)?.productHandles ?? []);
}
