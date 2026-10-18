import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { BuyPanel } from "@/components/product/buy-panel";
import { Gallery } from "@/components/product/gallery";
import { ProductCard } from "@/components/product/product-card";
import { SizeGuide } from "@/components/product/size-guide";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getAllProducts, getCollection, getProduct, getRelatedProducts, getSettings } from "@/lib/db/queries";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  if (!product) return {};
  const description = product.mythLine ?? product.description[0] ?? `${product.title} by Batsu.`;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title: `${product.title} — ${formatPrice(product.price)}`,
      description,
      images: product.images[0] ? [{ url: product.images[0].src, width: product.images[0].width, height: product.images[0].height }] : [],
    },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const [collection, related, { shipping, store }] = await Promise.all([
    product.collections[0] ? getCollection(product.collections[0]) : undefined,
    getRelatedProducts(product),
    getSettings(),
  ]);
  const position = collection ? collection.productHandles.indexOf(product.handle) + 1 : 0;
  const askLink = whatsappLink(store.whatsapp, `Hi Batsu, I have a question about the fit of the ${product.title}.`);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const freeShipping = shipping.freeShippingOver ? ` · free over ${formatPrice(shipping.freeShippingOver)}` : "";
  const bullets = ["Cash on delivery", "7-day returns", `Delivery in ${shipping.deliveryDays.replace(" working days", " days")}`, "Nationwide shipping"];
  const summary = "flex min-h-6 cursor-pointer list-none items-center justify-between text-xs font-medium tracking-[0.18em] uppercase [&::-webkit-details-marker]:hidden";
  const plus = <span aria-hidden className="text-xl font-light transition-transform duration-300 group-open:rotate-45">+</span>;

  return (
    <>
      <section className="mx-auto flex max-w-page flex-wrap items-start">
        <div data-product-gallery className="min-w-0 flex-[999_1_640px]">
          <Gallery images={product.images} title={product.title} />
        </div>

        <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6.5 px-gutter pt-8 pb-12 lg:sticky lg:top-0 lg:px-[clamp(16px,3vw,48px)] lg:pt-10">
          <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.16em] text-mute uppercase">
            <ol className="flex flex-wrap gap-2.5">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              {collection && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href={`/collections/${collection.handle}`} className="hover:text-ink">
                      {collection.title}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink">
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-2.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-1000">
            {collection && position > 0 && (
              <span className="eyebrow">
                {collection.title} — {pad(position)} / {pad(collection.productHandles.length)}
              </span>
            )}
            <h1 className="font-serif text-[clamp(40px,3.8vw,58px)] leading-none font-normal">{product.title}</h1>
            {product.mythLine &&
              (product.mythLine.length <= 32 ? (
                <p className="font-script text-[clamp(32px,3vw,44px)] leading-[1.1]">{product.mythLine}</p>
              ) : (
                <p className="font-serif text-[22px] leading-[1.35] text-[#1f1f1f] italic">“{product.mythLine}”</p>
              ))}
            <p className="mt-1.5 flex items-baseline gap-3 text-[17px] tracking-[0.02em]">
              {onSale && (
                <>
                  <s className="text-mute">{formatPrice(product.compareAtPrice!)}</s>
                  <span className="sr-only">now</span>
                </>
              )}
              <span>{formatPrice(product.price)}</span>
              {onSale && (
                <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-ink">
                  −{Math.round((1 - product.price / product.compareAtPrice!) * 100)}%
                </span>
              )}
            </p>
          </div>

          {product.description.filter((paragraph) => paragraph !== product.mythLine).map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="text-[15px] leading-[1.75] font-light text-[#3f3f3f]">
              {paragraph}
            </p>
          ))}

          <BuyPanel
            title={product.title}
            price={product.price}
            sizes={product.sizes}
            sizeGuide={product.sizeChart ? <SizeGuide chart={product.sizeChart} /> : undefined}
          />

          <ul aria-label="Delivery and returns" className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4.5 text-[13.5px]">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
                {b}
              </li>
            ))}
          </ul>

          {askLink && (
            <a
              href={askLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-line-strong text-[12.5px] tracking-[0.04em] hover:border-ink"
            >
              <WhatsAppIcon className="size-4.5 text-[#1a9e4b]" />
              Questions about fit? Ask us on WhatsApp
            </a>
          )}

          <div className="border-t border-line">
            {product.details.length > 0 && (
              <details open className="group border-b border-line py-4.5">
                <summary className={summary}>The details{plus}</summary>
                <dl className="mt-4 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 text-sm font-light">
                  {product.details.map((d) => (
                    <div key={d.label} className="contents">
                      <dt className="text-mute">{d.label}</dt>
                      <dd>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {product.fitNote && (
              <details className="group border-b border-line py-4.5">
                <summary className={summary}>Fit{plus}</summary>
                <p className="mt-3.5 text-sm leading-[1.7] font-light text-[#3f3f3f]">{product.fitNote}</p>
              </details>
            )}
            <details className="group border-b border-line py-4.5">
              <summary className={summary}>Shipping &amp; returns{plus}</summary>
              <p className="mt-3.5 text-sm leading-[1.7] font-light text-[#3f3f3f]">
                {formatPrice(shipping.flatFee)} delivery anywhere in Pakistan{freeShipping}, {shipping.deliveryDays} after your
                order is confirmed. Returns within 7 days, unworn with tags.{" "}
                <Link href="/policies/shipping-policy" className="underline underline-offset-4">
                  Shipping
                </Link>{" "}
                ·{" "}
                <Link href="/policies/refund-policy" className="underline underline-offset-4">
                  Returns
                </Link>
              </p>
            </details>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="wear-it-with" className="mt-12 bg-paper py-16 sm:pt-section sm:pb-24">
          <div className="mx-auto max-w-page px-gutter">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="eyebrow">{collection ? `From ${collection.title}` : "You may also like"}</span>
                <h2 id="wear-it-with" className="font-script text-[56px] leading-none font-normal sm:text-[72px]">
                  Wear it with
                </h2>
              </div>
              {collection && (
                <Link href={`/collections/${collection.handle}`} className="text-xs tracking-[0.08em] uppercase underline underline-offset-4">
                  Shop {collection.title}
                </Link>
              )}
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-3 lg:gap-4">
              {related.map((p) => (
                <li key={p.handle}>
                  <ProductCard product={p} showMyth sizes="(min-width: 1024px) 33vw, 50vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <WhatsAppButton productName={product.title} />
    </>
  );
}
