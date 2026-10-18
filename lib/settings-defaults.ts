// Store settings: typed shapes plus the defaults used when the database is empty or absent.
// The Phase 2 admin edits these rows in the `settings` table. Values marked PLACEHOLDER need the
// client's confirmation (listed in docs/LAUNCH_CHECKLIST.md).

export type StoreSettings = {
  announcement: { text: string; cta: string; href: string };
  whatsapp: string | null;
  /** PLACEHOLDER */
  supportHours: string;
  email: string;
  social: { instagram: string; facebook: string; tiktok: string | null };
};

export type ShippingSettings = {
  /** Integer PKR. The current Shopify policy charges a flat Rs. 250 nationwide. */
  flatFee: number;
  /** PLACEHOLDER: free shipping over this subtotal; null = never free. */
  freeShippingOver: number | null;
  deliveryDays: string;
};

export type DropSettings = {
  /** PLACEHOLDER: ISO date of the next drop; null hides the countdown numbers. */
  at: string | null;
  teaser: string;
  earlyAccessHours: number;
};

export type HeroSettings = {
  pieces: { handle: string; image: number; focus: string }[];
  /** Separate crops for desktop (landscape) and mobile (portrait), set in admin. */
  desktopImage: string | null;
  mobileImage: string | null;
};

export type SettingsMap = {
  store: StoreSettings;
  shipping: ShippingSettings;
  drop: DropSettings;
  hero: HeroSettings;
};

export const defaultSettings: SettingsMap = {
  store: {
    announcement: { text: "Modern Myths 25' is now live", cta: "Read more", href: "/collections/modern-myths" },
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
    supportHours: "Mon–Sat, 11am–7pm",
    email: "officialbatsu@gmail.com",
    social: {
      instagram: "https://www.instagram.com/batsuofficial/",
      facebook: "https://www.facebook.com/profile.php?id=61557333935152",
      tiktok: null,
    },
  },
  shipping: { flatFee: 250, freeShippingOver: null, deliveryDays: "5–8 working days" },
  drop: { at: "2026-11-15T12:00:00+05:00", teaser: "The next myth", earlyAccessHours: 24 },
  hero: {
    pieces: [
      { handle: "night-oracle", image: 2, focus: "50% 25%" },
      { handle: "the-lineage", image: 2, focus: "50% 25%" },
      { handle: "echo-skin", image: 0, focus: "50% 30%" },
      { handle: "the-construct", image: 1, focus: "50% 20%" },
    ],
    desktopImage: null,
    mobileImage: null,
  },
};
