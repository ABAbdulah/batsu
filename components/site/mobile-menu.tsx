"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MenuIcon } from "@/components/icons";

// The dialog runtime only downloads once someone reaches for the menu.
const loadSheet = () => import("./mobile-menu-sheet");
const MobileMenuSheet = dynamic(loadSheet, { ssr: false });

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={loadSheet}
        onTouchStart={loadSheet}
        onFocus={loadSheet}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className="grid size-11 place-items-center"
      >
        <MenuIcon className="size-5.5" />
      </button>
      {mounted && <MobileMenuSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
