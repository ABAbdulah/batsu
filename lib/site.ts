// Store settings. These move to the admin's settings table in Phase 2.
export const site = {
  name: "Batsu",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.batsuofficial.com",
  description: "Batsu — a Lahore clothing label. Every piece carries its own myth.",
  email: "officialbatsu@gmail.com",
  location: "Lahore, Pakistan",
  /** International format without "+", e.g. 923001234567. The WhatsApp button hides until set. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  social: {
    instagram: "https://www.instagram.com/batsuofficial/",
    facebook: "https://www.facebook.com/profile.php?id=61557333935152",
  },
  announcement: {
    text: "Modern Myths 25' is now live",
    cta: "Read more",
    href: "/collections/modern-myths",
  },
  /** Next drop for the countdown. Placeholder date until the client confirms it. */
  nextDropAt: "2026-11-15T12:00:00+05:00",
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

export function whatsappLink(message?: string): string | undefined {
  if (!site.whatsapp) return undefined;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}
