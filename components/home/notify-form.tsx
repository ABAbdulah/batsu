"use client";

import { useActionState, useId } from "react";
import { subscribe, type SubscribeState } from "@/lib/actions/subscribe";

export function NotifyForm({ source, variant = "pill" }: { source: string; variant?: "pill" | "line" }) {
  const id = useId();
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, { status: "idle" });

  if (state.status === "ok") {
    return (
      <p role="status" className="font-serif text-2xl">
        You&apos;re on the list. <em>We&apos;ll tell you first.</em>
      </p>
    );
  }

  const pill = variant === "pill";
  return (
    <form action={action} className={pill ? "w-[min(520px,100%)]" : "w-full"}>
      <input type="hidden" name="source" value={source} />
      <div
        className={
          pill
            ? "flex overflow-hidden rounded-full border border-white"
            : "flex border-b border-white"
        }
      >
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={pill ? "Your email" : "Email address"}
          aria-describedby={state.message ? `${id}-msg` : undefined}
          className={`min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60 ${pill ? "px-5.5 py-4" : "py-3.5"}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={
            pill
              ? "min-h-13 bg-brand px-6.5 label-caps text-ink transition-colors hover:bg-white disabled:opacity-60"
              : "min-h-12 label-caps text-xs text-brand hover:text-white disabled:opacity-60"
          }
        >
          {pill ? "Notify me" : "Subscribe →"}
        </button>
      </div>
      {state.message && (
        <p id={`${id}-msg`} role="status" className="mt-3 text-[13px] text-[#c9c9c9]">
          {state.message}
        </p>
      )}
    </form>
  );
}
