import Image from "next/image";
import type { ProductImage } from "@/lib/data/types";

type Tile = { image: ProductImage; wide: boolean };

// Editorial grid on desktop: portraits pair up two-across, landscapes (and a portrait left without
// a partner) run full width. On mobile it's a swipeable scroll-snap strip.
function layout(images: ProductImage[]): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const landscape = image.width > image.height;
    const next = images[i + 1];
    const pairable = !landscape && next && next.width <= next.height;
    if (pairable) {
      tiles.push({ image, wide: false }, { image: next, wide: false });
      i++;
    } else {
      tiles.push({ image, wide: true });
    }
  }
  return tiles;
}

export function Gallery({ images, title }: { images: ProductImage[]; title: string }) {
  if (images.length === 0) return <div className="aspect-4/5 bg-stone" />;
  return (
    <>
      <ul
        aria-label={`${title} photos`}
        className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <li key={image.src} className="relative aspect-4/5 w-[86%] shrink-0 snap-start overflow-hidden bg-stone">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="86vw"
              preload={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              placeholder={image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={image.blurDataUrl}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      <ul className="hidden grid-cols-2 gap-1.5 p-1.5 lg:grid">
        {layout(images).map(({ image, wide }, i) => (
          <li
            key={image.src}
            className={`group relative overflow-hidden bg-stone ${wide ? "col-span-2 aspect-16/10" : "aspect-4/5"}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 50vw"}
              loading={i < 2 ? "eager" : "lazy"}
              placeholder={image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={image.blurDataUrl}
              className="object-cover transition-transform duration-1400 ease-editorial group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          </li>
        ))}
      </ul>
    </>
  );
}
