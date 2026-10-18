import Link from "next/link";
import { ArrivalsCarousel } from "@/components/home/arrivals-carousel";
import { EditorialBand } from "@/components/home/editorial-band";
import { MythHero } from "@/components/home/myth-hero";
import { MythsGrid } from "@/components/home/myths-grid";
import { NextDrop } from "@/components/home/next-drop";
import { ServiceStrip } from "@/components/home/service-strip";
import { TeesBand } from "@/components/home/tees-band";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { ProductCard } from "@/components/product/product-card";
import { getHeroPieces } from "@/lib/data/home";
import { getCollection, getCollectionProducts, getProduct, getProducts, getSettings } from "@/lib/db/queries";

const SUMMER_VOL_1 = "summer-collection-oversize-shirt-streetwear";

export default async function HomePage() {
  const [heroPieces, arrivals, summerVol1, checkSet, echoSkin, tees, settings] = await Promise.all([
    getHeroPieces(),
    getCollectionProducts("summer-vol3"),
    getCollection(SUMMER_VOL_1),
    getProduct("check-set-cord-set-summer-clothes-summer-fabric-shirt-embroidery"),
    getProduct("echo-skin"),
    getCollectionProducts("t-shirts"),
    getSettings(),
  ]);
  const tunnelShot = checkSet?.images[0];
  const mythProducts = await getProducts(heroPieces.map((p) => p.handle));

  return (
    <>
      <MythHero pieces={heroPieces} />
      <ServiceStrip />

      <section id="new" aria-labelledby="new-heading" className="py-12 sm:py-section">
        <div className="mx-auto max-w-page">
          <ArrivalsCarousel
            title={
              <h2 id="new-heading" className="text-[13px] font-semibold tracking-[0.12em] uppercase sm:text-[15px]">
                Shop the new arrivals
              </h2>
            }
            viewAll={
              <Link href="/collections/summer-vol3" className="mr-3 text-[11px] tracking-[0.08em] uppercase underline underline-offset-4 sm:text-xs">
                View all
              </Link>
            }
          >
            {arrivals.map((p) => (
              <li key={p.handle} className="w-[min(316px,46vw)] shrink-0 snap-start">
                <ProductCard product={p} badge="NEW" sizes="(min-width: 640px) 316px, 46vw" />
              </li>
            ))}
          </ArrivalsCarousel>
        </div>
      </section>

      {summerVol1?.image && tunnelShot && (
        <EditorialBand
          images={[
            { ...tunnelShot, alt: "Model in the Check Set inside a weathered train carriage" },
            { ...summerVol1.image, alt: "Three models inside a rust-streaked train carriage" },
          ]}
          eyebrow="Batsu — The Summer Vol' edit"
          href={`/collections/${SUMMER_VOL_1}`}
          cta="Explore the edit"
        />
      )}

      <MythsGrid products={mythProducts} />

      {echoSkin && <NextDrop dropAt={settings.drop.at} teaser={settings.drop.teaser} backdrop={echoSkin.images[0]} />}

      <TeesBand tees={tees} />
      <WhatsAppButton />
    </>
  );
}
