import Link from "next/link";
import { NotifyForm } from "@/components/home/notify-form";
import { getCollections } from "@/lib/data";
import { policyLinks, site } from "@/lib/site";
import { LogoMark } from "./logo";

export function Footer() {
  const shop = getCollections().filter((c) => c.handle !== "summer-vol3" && c.handle !== "t-shirts");
  const heading = "text-[11px] font-medium tracking-[0.24em] text-[#8f8f8f] uppercase";
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex max-w-page flex-col gap-14 px-gutter pt-16 pb-7 sm:pt-section">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex max-w-120 flex-[1_1_360px] flex-col gap-4">
            <p className="font-serif text-[34px] leading-none sm:text-[40px]">
              Be first to the <em>next myth.</em>
            </p>
            <p className="text-[13.5px] font-light text-[#c9c9c9]">Sign up for new arrivals, offers, and more.</p>
            <NotifyForm source="footer" variant="line" />
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-10 text-[13.5px] font-light sm:flex sm:flex-wrap">
            <nav aria-label="Shop" className="flex flex-col gap-3">
              <span className={heading}>Shop</span>
              {shop.map((c) => (
                <Link key={c.handle} href={`/collections/${c.handle}`} className="hover:text-brand">
                  {c.title}
                </Link>
              ))}
            </nav>
            <nav aria-label="Help" className="flex flex-col gap-3">
              <span className={heading}>Help</span>
              {policyLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-brand">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <span className={heading}>Studio</span>
              <a href={`mailto:${site.email}`} className="break-all hover:text-brand">
                {site.email}
              </a>
              <span>{site.location}</span>
              <a href={site.social.instagram} className="hover:text-brand">
                Instagram
              </a>
              <a href={site.social.facebook} className="hover:text-brand">
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="flex items-end justify-center font-script text-[clamp(96px,20vw,300px)] leading-[0.9]">
          <LogoMark alt="" className="mr-[0.12em] h-[0.62em] w-auto self-center" />
          Batsu
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-[#2c2c2c] pt-5 text-[11px] tracking-[0.16em] text-[#8f8f8f] uppercase">
          <span>© 2026 Batsu</span>
          <span>{site.location}</span>
        </div>
      </div>
    </footer>
  );
}
