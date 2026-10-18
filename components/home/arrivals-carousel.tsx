"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

// Native scroll-snap track (swipeable, works without JS); the buttons and progress bar enhance it.
export function ArrivalsCarousel({ title, viewAll, children }: { title: ReactNode; viewAll: ReactNode; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 1);
      setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function step(direction: 1 | -1) {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: smooth ? "smooth" : "auto" });
  }

  const arrow =
    "grid size-11 place-items-center rounded-full border border-ink transition-colors disabled:cursor-default disabled:opacity-30";

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4 px-gutter lg:mb-8">
        {title}
        <div className="flex items-center gap-2">
          {viewAll}
          <button type="button" aria-label="Previous" onClick={() => step(-1)} disabled={edges.start} className={`${arrow} hidden bg-white sm:grid`}>
            <ArrowLeftIcon className="size-4" />
          </button>
          <button type="button" aria-label="Next" onClick={() => step(1)} disabled={edges.end} className={`${arrow} hidden bg-ink text-white sm:grid`}>
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory scroll-px-gutter gap-2.5 overflow-x-auto px-gutter [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div aria-hidden className="relative mx-auto mt-8 h-0.5 w-[min(380px,60%)] bg-[#e4e4e2] lg:mt-11">
        <div
          className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300"
          style={{ width: `${Math.max(12, progress * 100)}%` }}
        />
      </div>
    </>
  );
}
