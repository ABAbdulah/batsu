export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type ProductSize = {
  variantId: string;
  size: Size;
  available: boolean;
};

export type ProductDetail = {
  label: string;
  value: string;
};

export type Product = {
  handle: string;
  title: string;
  /** Integer PKR. */
  price: number;
  compareAtPrice?: number;
  /** The full myth, e.g. on the hero and product page. */
  mythLine?: string;
  /** A few words of the myth for cards. */
  mythShort?: string;
  description: string[];
  details: ProductDetail[];
  fitNote?: string;
  sizes: ProductSize[];
  images: ProductImage[];
  collections: string[];
  createdAt: string;
};

export type Collection = {
  handle: string;
  title: string;
  /** Shorter label for the header nav, when it differs from the title. */
  navLabel?: string;
  tagline?: string;
  intro?: string;
  image?: ProductImage;
  productHandles: string[];
};
