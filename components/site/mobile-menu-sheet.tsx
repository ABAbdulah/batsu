"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { primaryNav } from "@/lib/site";

export default function MobileMenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="px-6 pt-5 pb-8">
        <SheetTitle className="flex h-11 items-center text-mute">Menu</SheetTitle>
        <nav aria-label="Primary" className="mt-8">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} onClick={close} className="block py-4 font-serif text-[28px] leading-tight">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/account" onClick={close} className="mt-auto eyebrow">
          Account
        </Link>
      </SheetContent>
    </Sheet>
  );
}
