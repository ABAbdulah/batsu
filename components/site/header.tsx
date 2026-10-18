import Link from "next/link";
import { BagButton } from "@/components/cart/bag-button";
import { SearchIcon } from "@/components/icons";
import { LogoMark } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

// Mobile: menu · logo · bag (centred grid). Desktop: logo · nav · account/search/bag.
export function Header() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-page grid-cols-[1fr_auto_1fr] items-center gap-6 px-1.5 py-1.5 lg:flex lg:justify-between lg:px-gutter lg:py-3.5">
        <div className="lg:hidden">
          <MobileMenu />
        </div>

        <Link href="/" aria-label="Batsu home">
          <LogoMark alt="" className="h-8.75 w-8.5 lg:h-10.25 lg:w-10" preload />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <NavLinks className="flex flex-wrap gap-x-7.5 gap-y-2 text-[12.5px] tracking-[0.04em]" />
        </nav>

        <div className="flex items-center justify-end gap-1">
          <Link href="/account" className="hidden px-2.5 text-[12.5px] hover:text-brand lg:block">
            Account
          </Link>
          <Link href="/search" aria-label="Search" className="hidden size-11 place-items-center lg:grid">
            <SearchIcon className="size-4.75" />
          </Link>
          <BagButton />
        </div>
      </div>
    </header>
  );
}
