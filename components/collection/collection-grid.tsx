"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/cart/quick-add";
import type { Product, ProductImage, Size } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";

export type GridProduct = Pick<Product, "handle" | "title" | "price" | "mythShort" | "images" | "sizes">;

type Feature = { href: string; cta: string; text: string; emphasis: string; rest: string; image: ProductImage };
type Sort = "featured" | "asc" | "desc";

const SORTS: [Sort, string][] = [
  ["featured", "Featured"],
  ["asc", "Price ↑"],
  ["desc", "Price ↓"],
];
const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];
const COLUMN_CLASS = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;

function soldOutNote(p: GridProduct) {
  const out = p.sizes.filter((s) => !s.available);
  if (out.length === 0) return undefined;
  if (out.length === p.sizes.length) return "Sold out";
  return `${out.map((s) => s.size).join(", ")} sold out`;
}

export function CollectionGrid({ products, feature }: { products: GridProduct[]; feature?: Feature }) {
  const [size, setSize] = useState<Size | null>(null);
  const [sort, setSort] = useState<Sort>("featured");
  const [columns, setColumns] = useState<2 | 3 | 4>(3);

  const sizes = useMemo(
    () => SIZE_ORDER.filter((s) => products.some((p) => p.sizes.some((v) => v.size === s))),
    [products]
  );
  const visible = useMemo(() => {
    const list = products.filter((p) => !size || p.sizes.some((s) => s.size === size && s.available));
    if (sort === "asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, size, sort]);

  const chip = (on: boolean) =>
    `min-h-11 min-w-11 rounded-full border px-3.5 text-[12.5px] transition-colors ${on ? "border-ink bg-ink text-white" : "border-line-strong bg-white hover:border-ink"}`;
  const count = `${visible.length} ${visible.length === 1 ? "piece" : "pieces"}`;
  const showFeature = feature && sort === "featured" && !size && visible.length > 3;

  return (
    <>
      <div className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-3">
          <div role="group" aria-label="Filter by size" className="flex flex-wrap items-center gap-2">
            <span className="mr-1.5 text-[11px] font-medium tracking-[0.2em] uppercase">Size</span>
            {sizes.map((s) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(size === s ? null : s)} className={chip(size === s)}>
                {s}
              </button>
            ))}
            {size && (
              <button type="button" onClick={() => setSize(null)} className="min-h-11 px-2 text-xs underline underline-offset-[3px]">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-5.5 gap-y-2">
            <span role="status" className="text-xs text-mute">
              {count}
            </span>
            <div role="group" aria-label="Sort" className="flex items-center gap-1">
              <span className="mr-1.5 text-[11px] font-medium tracking-[0.2em] uppercase">Sort</span>
              {SORTS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={sort === key}
                  onClick={() => setSort(key)}
                  className={`min-h-11 px-2 text-[12.5px] decoration-brand decoration-2 underline-offset-[5px] ${sort === key ? "text-ink underline" : "text-[#7a7a7a] hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Columns" className="hidden items-center gap-1 border-l border-line pl-4.5 lg:flex">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} columns`}
                  aria-pressed={columns === n}
                  onClick={() => setColumns(n)}
                  className="grid size-11 place-items-center"
                >
                  <span className="flex gap-0.5">
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className={`block h-3.5 w-1 ${columns === n ? "bg-ink" : "bg-[#bdbdbd]"}`} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section aria-label="Products" className="mx-auto max-w-page px-gutter pt-10 pb-6">
        {visible.length === 0 ? (
          <p className="py-16 text-center font-serif text-[26px] italic">Nothing in that size right now.</p>
        ) : (
          <ul className={`grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 lg:gap-y-12 ${COLUMN_CLASS[columns]}`}>
            {visible.map((p, i) => (
              <GridItems key={p.handle} product={p} index={i} feature={showFeature && i === 3 ? feature : undefined} />
            ))}
          </ul>
        )}
        <div className="mt-16 flex flex-col items-center gap-3.5">
          <span className="text-xs text-mute">
            Showing {visible.length} of {products.length}
          </span>
          <span aria-hidden className="block h-0.5 w-55 bg-ink" />
        </div>
      </section>
    </>
  );
}

function GridItems({ product, index, feature }: { product: GridProduct; index: number; feature?: Feature }) {
  return (
    <>
      {feature && <FeatureTile feature={feature} />}
      <li className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
        <CollectionCard product={product} eager={index < 3} />
      </li>
    </>
  );
}

function CollectionCard({ product: p, eager }: { product: GridProduct; eager: boolean }) {
  const href = `/products/${p.handle}`;
  const note = soldOutNote(p);
  const [primary, secondary] = p.images;
  const sizes = "(min-width: 1024px) 33vw, 50vw";
  return (
    <article className="group flex flex-col gap-3.5">
      <div data-card className="relative aspect-4/5 overflow-hidden bg-stone">
        <Link href={href} aria-label={p.title} className="absolute inset-0 block">
          {primary && (
            <Image
              src={primary.src}
              alt={primary.alt}
              fill
              sizes={sizes}
              loading={eager ? "eager" : "lazy"}
              className="object-cover transition-transform duration-1200 ease-editorial group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          )}
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes={sizes}
              className="bg-white object-cover opacity-0 transition-opacity duration-600 group-hover:opacity-100 motion-reduce:transition-none"
            />
          )}
        </Link>
        {note && (
          <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
            {note}
          </span>
        )}
        <QuickAdd title={p.title} sizes={p.sizes} />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <Link href={href} className="text-sm font-medium hover:text-brand">
          {p.title}
        </Link>
        <span className="text-[13px] whitespace-nowrap">{formatPrice(p.price)}</span>
      </div>
      {p.mythShort && (
        <span className="-mt-1.5 font-serif text-[17px] leading-tight text-[#3a3a3a] italic">{p.mythShort}</span>
      )}
    </article>
  );
}

function FeatureTile({ feature }: { feature: Feature }) {
  return (
    <li className="col-span-2 flex flex-wrap bg-ink text-white">
      <div className="relative min-h-72 flex-[1_1_280px] overflow-hidden sm:min-h-90">
        <Image src={feature.image.src} alt={feature.image.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-[1_1_280px] flex-col justify-center gap-4.5 p-[clamp(28px,3vw,48px)]">
        <span className="eyebrow text-brand">The details</span>
        <p className="font-serif text-[clamp(28px,2.6vw,40px)] leading-[1.1]">
          {feature.text} <em>{feature.emphasis}</em> {feature.rest}
        </p>
        <Link
          href={feature.href}
          className="self-start rounded-full bg-white px-6.5 py-3.5 label-caps text-[11px] text-ink transition-colors hover:bg-brand"
        >
          {feature.cta}
        </Link>
      </div>
    </li>
  );
}
