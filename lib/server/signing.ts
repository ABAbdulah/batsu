import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// HMAC signing for first-party cookies (cart token, cookie cart). Reuses BETTER_AUTH_SECRET.
function secret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    console.warn("BETTER_AUTH_SECRET is not set; cookies are signed with an insecure fallback key.");
  }
  return "batsu-dev-only-secret";
}

export function sign(value: string): string {
  const mac = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

export function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const dot = signed.lastIndexOf(".");
  if (dot < 1) return null;
  const value = signed.slice(0, dot);
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signed);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? value : null;
}
