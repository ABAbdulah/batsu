import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  aspect?: "portrait" | "tall";
  badge?: string;
  showMyth?: boolean;
  sizes: string;
  /** Overlay inside the image box, e.g. a quick-add control. */
  overlay?: ReactNode;
};

export function ProductCard({ product, aspect = "portrait", badge, showMyth, sizes, overlay }: ProductCardProps) {
  const href = `/products/${product.handle}`;
  const [image] = product.images;
  return (
    <article className="group flex flex-col gap-3">
      <div
        className={`relative overflow-hidden bg-stone ${aspect === "tall" ? "aspect-2/3 bg-[#ebebe8]" : "aspect-4/5"}`}
      >
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          {image && (
            <Image
              src={image.src}
              alt=""
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-1000 ease-editorial group-hover:scale-[1.045] motion-reduce:transition-none"
            />
          )}
        </Link>
        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-white px-2.25 py-1.25 text-[10px] font-semibold tracking-[0.14em]">
            {badge}
          </span>
        )}
        {overlay}
      </div>
      <div className="flex flex-col gap-1 px-2 text-center">
        <Link href={href} className="text-[13.5px] font-medium hover:text-brand">
          {product.title}
        </Link>
        {showMyth && product.mythShort && (
          <span className="font-serif text-base leading-[1.3] text-[#3a3a3a] italic">{product.mythShort}</span>
        )}
        <span className="text-[12.5px] text-[#555]">{formatPrice(product.price)}</span>
      </div>
      <SizeList product={product} />
    </article>
  );
}

export function SizeList({ product }: { product: Product }) {
  return (
    <ul aria-label="Sizes" className="flex justify-center gap-3.5 text-[11.5px] tracking-[0.06em]">
      {product.sizes.map((s) => (
        <li key={s.variantId} className={s.available ? undefined : "text-[#b5b5b5] line-through"}>
          {s.size}
          {!s.available && <span className="sr-only"> (sold out)</span>}
        </li>
      ))}
    </ul>
  );
}
