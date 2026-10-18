"use client";

import { useSyncExternalStore } from "react";

// One shared 1s ticker. The server snapshot is null, so the prerendered HTML shows "––" and the
// numbers appear on hydration without a mismatch.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((l) => l());
  }, 1000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const units = [
  ["Days", 86_400_000, Infinity],
  ["Hours", 3_600_000, 24],
  ["Minutes", 60_000, 60],
  ["Seconds", 1000, 60],
] as const;

export function Countdown({ to }: { to: string }) {
  const current = useSyncExternalStore(subscribe, () => now, () => null);
  const remaining = current === null ? null : Math.max(0, Date.parse(to) - current);

  return (
    <div
      role="timer"
      aria-label={`Drop opens ${new Date(to).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Karachi" })}`}
      className="my-2 grid w-[min(640px,100%)] grid-cols-4 gap-[clamp(8px,2vw,20px)] sm:my-4"
    >
      {units.map(([label, ms, mod], i) => {
        const value = remaining === null ? "––" : String(Math.floor(remaining / ms) % mod).padStart(2, "0");
        const last = i === units.length - 1;
        return (
          <div
            key={label}
            aria-hidden
            className={`flex flex-col gap-1.5 border px-2 pt-4.5 pb-3.5 ${last ? "border-brand" : "border-white/20"}`}
          >
            <span className={`font-serif text-[clamp(40px,5vw,72px)] leading-none tabular-nums ${last ? "text-brand" : ""}`}>{value}</span>
            <span className="text-[10px] tracking-[0.24em] text-[#bdbdbd] uppercase sm:text-[10.5px]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
