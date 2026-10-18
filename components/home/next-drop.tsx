import Image from "next/image";
import Link from "next/link";
import { Countdown } from "./countdown";
import { NotifyForm } from "./notify-form";
import type { ProductImage } from "@/lib/data";

export function NextDrop({ dropAt, backdrop }: { dropAt: string; backdrop: ProductImage }) {
  return (
    <section id="drop" className="relative overflow-hidden bg-ink text-white">
      <Image
        src={backdrop.src}
        alt=""
        fill
        sizes="50vw"
        className="scale-[1.2] object-cover blur-[22px] brightness-[0.32]"
      />
      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center gap-5.5 px-gutter py-20 text-center sm:py-26">
        <span className="eyebrow tracking-[0.34em] text-brand">Coming soon — limited run</span>
        <h2 className="font-script text-[clamp(72px,9vw,140px)] leading-[0.9] font-normal">The next myth</h2>
        <p className="font-serif text-[22px] text-[#e4e4e4] italic sm:text-[26px]">Members get 24 hours early access.</p>
        <Countdown to={dropAt} />
        <NotifyForm source="next-drop" />
        <Link href="/account/signup" className="text-xs tracking-[0.1em] uppercase underline underline-offset-[5px] hover:text-brand">
          Create an account for early access →
        </Link>
      </div>
    </section>
  );
}
