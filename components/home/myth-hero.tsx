"use client";

import { Fragment, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { MotionProvider } from "@/components/motion/motion-provider";
import { buttonVariants } from "@/components/ui/button-variants";
import type { HeroPiece } from "@/lib/data/home";
import { formatPrice } from "@/lib/format";

const ROTATE_SECONDS = 4;
const pad = (n: number) => String(n).padStart(2, "0");
// Desktop accordion geometry, as fractions of the strip: the active panel takes 70%, the rest share
// 30%. Each panel is the full strip clipped to its slot (clip-path alone draws the edges, so
// neighbours can never gap or overlap mid-animation); the photo inside is a 70%-wide box slid to
// the slot's centre.
const ACTIVE_SHARE = 0.7;

function panelGeometry(index: number, active: number, count: number) {
  const rest = (1 - ACTIVE_SHARE) / (count - 1);
  const widthOf = (i: number) => (i === active ? ACTIVE_SHARE : rest);
  let left = 0;
  for (let i = 0; i < index; i++) left += widthOf(i);
  const width = widthOf(index);
  const pct = (n: number) => `${(n * 100).toFixed(3)}%`;
  // 1px gap on the left of every panel but the first shows the ink background as a divider.
  const divider = index > 0 ? " + 1px" : "";
  return {
    "--panel-clip": `inset(0 ${pct(1 - left - width)} 0 calc(${pct(left)}${divider}))`,
    "--panel-x": `translateX(${pct((left + width / 2 - ACTIVE_SHARE / 2) / ACTIVE_SHARE)})`,
  } as CSSProperties;
}

const letterVariants = {
  hidden: { opacity: 0, y: "0.18em" },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const } },
};

// Motion is only loaded on routes that animate with it, so pages like collections stay lighter.
export function MythHero({ pieces }: { pieces: HeroPiece[] }) {
  return (
    <MotionProvider>
      <MythHeroInner pieces={pieces} />
    </MotionProvider>
  );
}

function MythHeroInner({ pieces }: { pieces: HeroPiece[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  // Any manual pick stops the rotation for good; reduced-motion users never get it.
  const [paused, setPaused] = useState(false);
  // Skip the write-in on first paint so the server-rendered name is the LCP text.
  const [changes, setChanges] = useState(0);
  const reduceMotion = useReducedMotion();
  const rotating = !paused && !reduceMotion;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = pieces[active];

  function show(index: number, byUser: boolean) {
    if (byUser) setPaused(true);
    if (index === active) return;
    setActive(index);
    setChanges((c) => c + 1);
  }

  function onTabKey(event: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const jump = { Home: 0, End: pieces.length - 1 }[event.key];
    if (step === undefined && jump === undefined) return;
    event.preventDefault();
    const next = jump ?? (active + step! + pieces.length) % pieces.length;
    show(next, true);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="myths" aria-roledescription="carousel" aria-label="Modern Myths 25'" className="bg-white">
      <div className="mx-auto flex max-w-wide flex-col lg:flex-row lg:items-stretch">
        {/* Copy + tabs */}
        <div className="order-2 flex min-w-0 flex-col gap-6 px-gutter pt-5 pb-10 lg:order-1 lg:flex-[1_1_440px] lg:justify-between lg:gap-10 lg:pt-12">
          <div className="hidden items-baseline justify-between gap-4 eyebrow lg:flex">
            <span>Modern Myths 25&apos;</span>
            <span className="text-mute">
              {pad(active + 1)} / {pad(pieces.length)}
            </span>
          </div>

          <div
            id={`${id}-panel`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            aria-live={rotating ? "off" : "polite"}
            className="flex flex-col items-center gap-3 text-center lg:items-start lg:gap-5.5 lg:text-left"
          >
            <span className="text-[10px] font-medium tracking-[0.32em] uppercase lg:hidden">
              Modern Myths 25&apos; — {pad(active + 1)} / {pad(pieces.length)}
            </span>
            <h1 className="hidden font-serif text-[22px] text-[#3a3a3a] italic lg:block">Four pieces. Four myths.</h1>

            <m.h2
              key={current.handle}
              aria-label={current.name}
              initial={changes === 0 ? false : "hidden"}
              animate="shown"
              variants={{ shown: { transition: { staggerChildren: 0.035 } } }}
              className="min-h-[1.8em] font-script text-[76px] leading-[0.9] font-normal lg:text-[clamp(76px,7.4vw,124px)]"
            >
              {current.name.split(" ").map((word, w) => (
                // Words stay unbreakable; only the letters inside them animate.
                <Fragment key={w}>
                  {w > 0 && " "}
                  <span aria-hidden className="inline-block whitespace-nowrap">
                    {Array.from(word).map((char, i) => (
                      <m.span key={i} className="inline-block" variants={letterVariants}>
                        {char}
                      </m.span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </m.h2>

            <m.p
              key={`${current.handle}-line`}
              initial={changes === 0 ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
              className="min-h-[3.9em] max-w-115 font-serif text-[21px] leading-[1.3] text-[#1f1f1f] lg:text-[27px]"
            >
              “{current.mythLine}”
            </m.p>

            <div className="flex flex-wrap items-center justify-center gap-5.5">
              <Link href={`/products/${current.handle}`} className={buttonVariants()}>
                Shop {current.name}
                <span className="lg:hidden">— {formatPrice(current.price)}</span>
              </Link>
              <span className="hidden text-sm tracking-[0.04em] lg:inline">{formatPrice(current.price)}</span>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Modern Myths pieces"
            onKeyDown={onTabKey}
            className="order-first grid grid-cols-4 gap-1.5 lg:order-0 lg:gap-3"
          >
            {pieces.map((piece, i) => {
              const selected = i === active;
              return (
                <button
                  key={piece.handle}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`${id}-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => show(i, true)}
                  className="group flex min-h-11 flex-col gap-2.5 text-left"
                >
                  <span className="relative block h-0.5 overflow-hidden bg-[#e4e4e2]">
                    {selected &&
                      (rotating ? (
                        <m.span
                          key={`${piece.handle}-progress`}
                          className="absolute inset-0 origin-left bg-brand"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: ROTATE_SECONDS, ease: "linear" }}
                          onAnimationComplete={() => show((active + 1) % pieces.length, false)}
                        />
                      ) : (
                        <span className="absolute inset-0 bg-brand" />
                      ))}
                  </span>
                  <span className="text-[11px] tracking-[0.14em] text-mute">{pad(i + 1)}</span>
                  <span
                    className={`hidden text-[13px] sm:block ${selected ? "font-semibold text-ink" : "text-mute group-hover:text-ink"}`}
                  >
                    {piece.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panels: stacked crossfade on mobile, expanding accordion on desktop. Mouse-only
            shortcut to the tabs above, so hidden from assistive tech. On desktop every panel is
            a fixed 70%-wide box that slides (transform) and is revealed (clip-path), so the
            animation never triggers layout or resizes the photos. */}
        <div
          aria-hidden
          className="relative order-1 h-[clamp(420px,72svh,560px)] min-w-0 overflow-hidden bg-ink lg:order-2 lg:h-[min(820px,calc(100svh-40px))] lg:min-h-160 lg:flex-[999_1_640px]"
        >
          {pieces.map((piece, i) => {
            const selected = i === active;
            return (
              <Link
                key={piece.handle}
                href={`/products/${piece.handle}`}
                tabIndex={-1}
                onClick={(event) => {
                  if (selected) return;
                  event.preventDefault();
                  show(i, true);
                }}
                data-active={selected}
                style={panelGeometry(i, active, pieces.length)}
                className="group/panel absolute inset-0 block overflow-hidden bg-[#e9e9e9] transition-opacity duration-700 ease-editorial data-[active=false]:pointer-events-none data-[active=false]:opacity-0 motion-reduce:transition-none lg:transition-[clip-path] lg:duration-1100 lg:ease-panel lg:[clip-path:var(--panel-clip)] lg:data-[active=false]:pointer-events-auto lg:data-[active=false]:opacity-100"
              >
                <span className="absolute inset-y-0 left-0 w-full lg:w-[70%] lg:transform-(--panel-x) lg:transition-transform lg:duration-1100 lg:ease-panel motion-reduce:transition-none">
                  <span className="absolute inset-0 transition-transform duration-1600 ease-editorial group-data-[active=false]/panel:scale-[1.12] motion-reduce:transition-none">
                    <Image
                      src={piece.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      preload={i === 0}
                      loading="eager"
                      style={{ objectPosition: piece.focus }}
                      className="object-cover"
                    />
                    {/* Pre-filtered copy faded with opacity: animating filter repaints every frame. */}
                    <Image
                      src={piece.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      loading="eager"
                      style={{ objectPosition: piece.focus }}
                      className="hidden object-cover grayscale-100 brightness-[1.04] transition-opacity duration-1100 ease-editorial group-data-[active=true]/panel:opacity-0 motion-reduce:transition-none lg:block"
                    />
                  </span>
                  <span className="absolute right-4 bottom-4 hidden rounded-full bg-white px-5 py-3 label-caps text-[11px] text-ink transition-[opacity,background-color] duration-500 group-hover/panel:bg-brand group-data-[active=false]/panel:opacity-0 lg:block">
                    View piece +
                  </span>
                  <span className="absolute inset-0 hidden flex-col items-center justify-end gap-3.5 pb-7 transition-opacity duration-500 group-data-[active=true]/panel:opacity-0 lg:flex">
                    <span className="rotate-180 bg-white px-2.25 py-4 text-[11px] font-medium tracking-eyebrow text-ink uppercase [writing-mode:vertical-rl]">
                      {piece.name}
                    </span>
                    <span className="grid size-7.5 place-items-center rounded-full bg-white text-[11px] text-ink">
                      {pad(i + 1)}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
