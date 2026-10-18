import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { ProductImage } from "@/lib/data";

// Dark full-bleed band. The images drift slightly on scroll via a CSS scroll-driven animation
// (globals.css `.parallax`): no JS, and browsers without support just show them still.
export function EditorialBand({
  images,
  eyebrow,
  href,
  cta,
}: {
  images: [ProductImage, ProductImage];
  eyebrow: string;
  href: string;
  cta: string;
}) {
  return (
    <section className="relative h-[420px] overflow-hidden bg-[#12140c] sm:h-[760px]">
      <div className="absolute inset-0 grid sm:grid-cols-2">
        {images.map((image, i) => (
          <div key={image.src} className={`relative overflow-hidden ${i === 0 ? "hidden sm:block" : ""}`}>
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="parallax object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[rgb(8_8_6/0.4)]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white sm:gap-3.5">
        <span className="text-[10px] font-medium tracking-[0.32em] uppercase sm:text-[11px] sm:tracking-[0.34em]">{eyebrow}</span>
        <h2 className="font-serif text-[48px] leading-[0.95] font-normal tracking-[-0.01em] sm:text-[clamp(56px,7vw,104px)]">
          Louder days,
          <br />
          <em>brighter nights.</em>
        </h2>
        <Link href={href} className={buttonVariants({ variant: "light", className: "mt-3.5 sm:mt-6.5" })}>
          {cta}
        </Link>
      </div>
    </section>
  );
}
