// One myth per piece ("Every piece carries its own myth"). Moves to products.myth_line
// with the database; until then, keyed by product handle.
export const myths: Record<string, { line?: string; short: string }> = {
  "night-oracle": {
    line: "Moths drawn to unseen light — a symbol of fragile persistence beneath muted skies.",
    short: "Moths drawn to unseen light.",
  },
  "the-lineage": {
    line: "Threads tracing heritage — a quiet ode to generational rhythm, reimagined in modern form.",
    short: "Threads tracing heritage.",
  },
  "echo-skin": {
    line: "Reflections stitched in restraint — purity mirrored through maroon thread on white silence.",
    short: "Reflections stitched in restraint.",
  },
  "the-construct": {
    line: "Geometry softened by hand; a grid of stillness holding quiet light.",
    short: "Geometry softened by hand.",
  },
  "untitled-apr20_17-01": { line: "Sunlight, folded.", short: "Pleats in warm, abstract tones." },
  "terra-dye-shirt": { short: "Terracotta melting into white tie-dye." },
  "tarkashi-shirt": { short: "Hand-painted fleur-de-lis." },
  "florae-shirt": { short: "Florals scattered on white linen." },
  "petal-shirt": { short: "Fiery orange, one black bloom." },
  "scallop-shirt": { short: "Scalloped embroidery on pale stripes." },
};
