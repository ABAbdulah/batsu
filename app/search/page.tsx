import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView, type SearchItem } from "@/components/search/search-view";
import { getAllProducts, getCollections } from "@/lib/db/queries";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

// The catalogue is small, so search runs in the browser over a prerendered index: the page stays
// static and costs no function call per query.
export default async function SearchPage() {
  const [products, collections] = await Promise.all([getAllProducts(), getCollections()]);
  const titleOf = new Map(collections.map((c) => [c.handle, c.title]));
  const items: SearchItem[] = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    price: p.price,
    mythShort: p.mythShort,
    image: p.images[0] ? { src: p.images[0].src, alt: p.images[0].alt } : undefined,
    soldOut: p.sizes.every((s) => !s.available),
    text: [p.title, p.mythLine, p.mythShort, ...p.description, ...p.details.map((d) => d.value), ...p.collections.map((c) => titleOf.get(c))]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  return (
    <section className="mx-auto max-w-page px-gutter pt-10 pb-24">
      <h1 className="font-script text-[72px] leading-none font-normal sm:text-[96px]">Search</h1>
      <Suspense>
        <SearchView items={items} />
      </Suspense>
    </section>
  );
}
