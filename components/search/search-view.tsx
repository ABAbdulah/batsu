"use client";

import { useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

export type SearchItem = {
  handle: string;
  title: string;
  price: number;
  mythShort?: string;
  image?: { src: string; alt: string };
  soldOut: boolean;
  text: string;
};

function matches(item: SearchItem, terms: string[]) {
  return terms.every((t) => item.text.includes(t));
}

export function SearchView({ items }: { items: SearchItem[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferred = useDeferredValue(query);
  const terms = deferred.toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length ? items.filter((i) => matches(i, terms)) : [];

  function update(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex max-w-xl border-b border-ink">
        <label htmlFor="search-input" className="sr-only">
          Search the store
        </label>
        <input
          id="search-input"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => update(e.target.value)}
          placeholder="Search pieces, fabrics, collections"
          className="min-w-0 flex-1 bg-transparent py-3.5 text-lg outline-none placeholder:text-mute"
        />
      </form>

      {terms.length > 0 && (
        <p role="status" className="text-sm text-mute">
          {results.length} {results.length === 1 ? "result" : "results"} for “{deferred}”
        </p>
      )}

      {terms.length > 0 && results.length === 0 && (
        <p className="font-serif text-2xl italic">Nothing matches that yet. Try a fabric, a colour or a collection.</p>
      )}

      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {results.map((item) => (
          <li key={item.handle}>
            <Link href={`/products/${item.handle}`} className="group flex flex-col gap-3">
              <span className="relative block aspect-4/5 overflow-hidden bg-stone">
                {item.image && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-editorial group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                )}
                {item.soldOut && (
                  <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
                    Sold out
                  </span>
                )}
              </span>
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium group-hover:text-brand">{item.title}</span>
                <span className="text-[13px] whitespace-nowrap">{formatPrice(item.price)}</span>
              </span>
              {item.mythShort && <span className="-mt-1.5 font-serif text-base text-[#3a3a3a] italic">{item.mythShort}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
