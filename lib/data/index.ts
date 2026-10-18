import catalog from "./catalog.json";
import { collectionCopy } from "./collection-copy";
import { myths } from "./myths";
import type { Collection, Product } from "./types";

export type * from "./types";

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
