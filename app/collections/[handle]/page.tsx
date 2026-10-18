import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionGrid, type GridProduct } from "@/components/collection/collection-grid";
import { getCollection, getCollectionProducts, getCollections, getProduct } from "@/lib/db/queries";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  return [...(await getCollections()).map((c) => ({ handle: c.handle })), { handle: "all" }];
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const collection = await getCollection((await params).handle);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.intro ?? collection.tagline,
    alternates: { canonical: `/collections/${collection.handle}` },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function CollectionPage({ params }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  const [listed, allCollections] = await Promise.all([getCollectionProducts(handle), getCollections()]);
  const collage = listed.filter((p) => p.images.length > 0).slice(0, 3);
  const others = allCollections.filter((c) => c.handle !== handle && c.handle !== "summer-vol3");

  const gridProducts: GridProduct[] = listed.map((p) => ({
    handle: p.handle,
    title: p.title,
    price: p.price,
    mythShort: p.mythShort,
    images: p.images.slice(0, 2),
    sizes: p.sizes,
  }));

  const featureProduct = collection.feature && (await getProduct(collection.feature.productHandle));
  const feature =
    collection.feature && featureProduct
      ? {
          ...collection.feature,
          href: `/products/${featureProduct.handle}`,
          cta: `Shop ${featureProduct.title.replace(/ Shirt$/, "")}`,
          image: featureProduct.images[collection.feature.imageIndex] ?? featureProduct.images[0],
        }
      : undefined;

  return (
    <>
      <section className="mx-auto flex max-w-page flex-wrap items-center gap-[clamp(32px,5vw,80px)] px-gutter pt-8 pb-12 lg:pt-10 lg:pb-16">
        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
          <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.18em] text-mute uppercase">
            <ol className="flex flex-wrap gap-2.5">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>Collections</li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">
                {collection.title}
              </li>
            </ol>
          </nav>
          <span className="mt-4 eyebrow lg:mt-6">Collection — {pad(listed.length)} pieces</span>
          <h1 className="font-script text-[clamp(72px,10vw,156px)] leading-[0.85] font-normal">{collection.title}</h1>
          {collection.tagline && (
            <p className="font-serif text-[26px] leading-tight italic lg:text-[30px]">{collection.tagline}</p>
          )}
          {collection.intro && (
            <p className="max-w-115 text-[15px] leading-[1.75] font-light text-[#4a4a4a]">{collection.intro}</p>
          )}
          <nav aria-label="Collections" className="mt-3">
            <ul className="flex flex-wrap gap-2">
              {allCollections.map((c) => {
                const current = c.handle === handle;
                return (
                  <li key={c.handle}>
                    <Link
                      href={`/collections/${c.handle}`}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4.5 text-xs tracking-[0.04em] transition-colors ${current ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink"}`}
                    >
                      {c.navLabel ?? c.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {collage.length === 3 && (
          <div className="grid min-w-0 flex-[1_1_560px] grid-cols-5 grid-rows-[repeat(2,clamp(180px,22vw,300px))] gap-2.5">
            {collage.map((p, i) => (
              <Link
                key={p.handle}
                href={`/products/${p.handle}`}
                className={`group relative overflow-hidden bg-stone ${i === 0 ? "col-span-3 row-span-2" : "col-span-2"}`}
              >
                <Image
                  src={p.images[0].src}
                  alt={p.images[0].alt}
                  fill
                  preload={i === 0}
                  sizes={i === 0 ? "(min-width: 1024px) 30vw, 60vw" : "(min-width: 1024px) 20vw, 40vw"}
                  className="object-cover transition-transform duration-1400 ease-editorial group-hover:scale-105 motion-reduce:transition-none"
                />
                {i === 0 && (
                  <span className="absolute bottom-3.5 left-3.5 rounded-full bg-white px-3.5 py-2 text-[11px] tracking-[0.08em]">
                    {p.title} — {formatPrice(p.price)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <CollectionGrid products={gridProducts} feature={feature} />

      {others.length > 0 && (
        <section aria-labelledby="explore" className="mx-auto max-w-page px-gutter pt-16 pb-24">
          <h2 id="explore" className="mb-7 text-center eyebrow">
            Keep exploring
          </h2>
          <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {others.slice(0, 3).map((c) => (
              <li key={c.handle} className="border-b border-line">
                <Link href={`/collections/${c.handle}`} className="flex items-baseline justify-between gap-3 px-2 py-7 hover:text-brand">
                  <span className="font-script text-[44px] leading-none sm:text-[52px]">{c.title}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
