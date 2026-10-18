import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="mx-auto max-w-page px-gutter pt-10 pb-24">
      <h1 className="font-script text-[72px] leading-none font-normal sm:text-[96px]">Your bag</h1>
      <CartPageView />
    </section>
  );
}
