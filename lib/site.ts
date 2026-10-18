// Static site constants. Editable store settings (announcement, WhatsApp, socials, shipping,
// drop date, hero picks) live in lib/settings-defaults.ts and the `settings` table.
export const site = {
  name: "Batsu",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.batsuofficial.com",
  description: "Batsu — a Lahore clothing label. Every piece carries its own myth.",
  location: "Lahore, Pakistan",
};

// From the current Shopify policies (shipping: flat Rs. 250, 5–8 business days, Pakistan only;
// refunds: 7-day returns). Confirm the exchange wording with the client.
export const servicePoints = [
  { icon: "cash", title: "Cash on delivery", detail: "Pay when it arrives" },
  { icon: "exchange", title: "7-day returns", detail: "Unworn, tags on" },
  { icon: "truck", title: "Nationwide delivery", detail: "5–8 working days" },
  { icon: "chat", title: "WhatsApp support", detail: "Chat with the studio" },
] as const;

export const primaryNav = [
  { label: "New In", href: "/collections/summer-vol3" },
  { label: "Modern Myths 25'", href: "/collections/modern-myths" },
  { label: "Summer Vol'2", href: "/collections/summer-vol-2" },
  { label: "Summer Vol'1", href: "/collections/summer-collection-oversize-shirt-streetwear" },
  { label: "Winter Vol'1", href: "/collections/winter-collection-streetwear" },
  { label: "Tees", href: "/collections/t-shirts" },
];

export const policyLinks = [
  { label: "Shipping policy", href: "/policies/shipping-policy" },
  { label: "Refund policy", href: "/policies/refund-policy" },
  { label: "Terms of service", href: "/policies/terms-of-service" },
  { label: "Privacy policy", href: "/policies/privacy-policy" },
  { label: "Contact us", href: "/pages/contact" },
];

export function whatsappLink(number: string | null, message?: string): string | undefined {
  if (!number) return undefined;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}
