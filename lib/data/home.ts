import { getProduct, getSettings } from "@/lib/db/queries";

export type HeroPiece = {
  handle: string;
  name: string;
  mythLine: string;
  price: number;
  image: { src: string; width: number; height: number; alt: string };
  focus: string;
};

// The four "Four pieces. Four myths." panels come from settings.hero (picked in the admin later).
// `image` indexes the product's photos; `focus` keeps the piece in frame in a narrow panel.
export async function getHeroPieces(): Promise<HeroPiece[]> {
  const { hero } = await getSettings();
  const pieces = await Promise.all(
    hero.pieces.map(async ({ handle, image, focus }) => {
      const product = await getProduct(handle);
      if (!product?.mythLine || !product.images.length) return null;
      const photo = product.images[image] ?? product.images[0];
      return {
        handle,
        name: product.title,
        mythLine: product.mythLine,
        price: product.price,
        image: { src: photo.src, width: photo.width, height: photo.height, alt: `${product.title} on model` },
        focus,
      };
    })
  );
  return pieces.filter((p): p is HeroPiece => p !== null);
}
