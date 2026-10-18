import { getProduct } from ".";

// The four "Four pieces. Four myths." hero panels, in order. `image` indexes the product's
// photos; `focus` is the CSS object-position that keeps the piece in frame in a narrow panel.
const heroPieces = [
  { handle: "night-oracle", image: 2, focus: "50% 25%" },
  { handle: "the-lineage", image: 2, focus: "50% 25%" },
  { handle: "echo-skin", image: 0, focus: "50% 30%" },
  { handle: "the-construct", image: 1, focus: "50% 20%" },
];

export type HeroPiece = {
  handle: string;
  name: string;
  mythLine: string;
  price: number;
  image: { src: string; width: number; height: number; alt: string };
  focus: string;
};

export function getHeroPieces(): HeroPiece[] {
  return heroPieces.map(({ handle, image, focus }) => {
    const product = getProduct(handle);
    if (!product?.mythLine) throw new Error(`Hero piece "${handle}" is missing or has no myth line`);
    return {
      handle,
      name: product.title,
      mythLine: product.mythLine,
      price: product.price,
      image: { ...product.images[image], alt: `${product.title} on model` },
      focus,
    };
  });
}
