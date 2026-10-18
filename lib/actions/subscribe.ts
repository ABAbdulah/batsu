"use server";

export type SubscribeState = { status: "idle" | "ok" | "error"; message?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO(db): insert into newsletter_subscribers (email, source, consent_at) and return "ok".
// Until the database is connected it says so plainly rather than pretending to save the address.
export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL.test(email)) return { status: "error", message: "Enter a valid email address." };
  return { status: "error", message: "Sign-ups open soon. Follow @batsuofficial on Instagram for the drop." };
}
