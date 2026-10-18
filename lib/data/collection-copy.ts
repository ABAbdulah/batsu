import type { Collection } from "./types";

// Editorial copy per collection. Handles match the Shopify store so URLs survive the move.
export const collectionCopy: Record<string, Pick<Collection, "title" | "navLabel" | "tagline" | "intro" | "feature">> = {
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

// Display order for nav-style lists.
export const collectionOrder = Object.keys(collectionCopy);
