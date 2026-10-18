"use client";

import { useRef } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/data/types";

// Native <dialog>: modal focus handling and Esc for free, no dialog runtime to download.
export function SizeGuide({ chart }: { chart: ProductImage }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="min-h-11 text-xs underline underline-offset-4">
        Size guide
      </button>
      <dialog
        ref={dialog}
        aria-label="Size guide"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(720px,92vw)] rounded-sm p-0 backdrop:bg-ink/50"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="eyebrow">Size guide</span>
          <button type="button" onClick={() => dialog.current?.close()} className="grid size-11 place-items-center text-xl" aria-label="Close">
            ×
          </button>
        </div>
        <div className="p-5">
          <Image src={chart.src} alt={chart.alt} width={chart.width} height={chart.height} sizes="720px" className="h-auto w-full" />
        </div>
      </dialog>
    </>
  );
}
