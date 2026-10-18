import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/data";

export function MythsGrid({ products }: { products: Product[] }) {
  return (
    <section className="bg-paper py-16 sm:pt-section sm:pb-24">
      <div className="mx-auto max-w-page px-gutter">
        <div className="mb-10 flex flex-col items-center gap-2.5 text-center">
          <h2 className="text-[15px] font-semibold tracking-[0.12em] uppercase">Shop Modern Myths 25&apos;</h2>
          <p className="font-serif text-xl text-[#3a3a3a] italic">Every piece carries its own myth.</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-4">
          {products.map((p) => (
            <li key={p.handle}>
              <ProductCard product={p} aspect="tall" showMyth sizes="(min-width: 1024px) 25vw, 50vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
