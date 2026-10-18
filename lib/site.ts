export const site = {
  name: "Batsu",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.batsuofficial.com",
  description: "Batsu — a Lahore clothing label. Every piece carries its own myth.",
  announcement: {
    text: "Modern Myths 25' is now live",
    cta: "Read more",
    href: "/collections/modern-myths",
  },
};

export const primaryNav = [
  { label: "New In", href: "/collections/summer-vol3" },
  { label: "Modern Myths 25'", href: "/collections/modern-myths" },
  { label: "Summer Vol'2", href: "/collections/summer-vol-2" },
  { label: "Summer Vol'1", href: "/collections/summer-collection-oversize-shirt-streetwear" },
  { label: "Winter Vol'1", href: "/collections/winter-collection-streetwear" },
  { label: "Tees", href: "/collections/t-shirts" },
];
