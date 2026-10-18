import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export function TeesBand({ tees }: { tees: Product[] }) {
  const names = tees.map((t) => t.title);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} & ${names.at(-1)}` : names[0];
  const prices = new Set(tees.map((t) => t.price));
  const priceNote = prices.size === 1 ? `${formatPrice(tees[0].price)} each.` : `From ${formatPrice(Math.min(...prices))}.`;

  return (
    <section id="tees" className="bg-brand text-ink">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-8 px-gutter py-16 sm:py-section">
        <h2 className="font-script text-[clamp(64px,8vw,132px)] leading-[0.85] font-normal">
          Fresh tees
          <br />
          <span className="pl-[1.2em]">are here</span>
        </h2>
        <div className="flex max-w-90 flex-col gap-4.5">
          <p className="font-serif text-[26px] leading-tight">
            {list}. <em>{priceNote}</em>
          </p>
          <Link href="/collections/t-shirts" className={buttonVariants({ variant: "light", className: "self-start hover:bg-ink hover:text-white" })}>
            Discover T-shirts
          </Link>
        </div>
      </div>
    </section>
  );
}
