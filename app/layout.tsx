import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { CartProvider } from "@/components/cart/cart-provider";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { cormorant, jost, pinyon } from "@/lib/fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Batsu — Every piece carries its own myth", template: "%s — Batsu" },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", locale: "en_PK" },
};

export const viewport: Viewport = {
  themeColor: "#ec5d2f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Product photos come from Shopify's CDN; open the connection before the first <img> asks.
  preconnect("https://cdn.shopify.com");
  return (
    <html lang="en" className={`${jost.variable} ${pinyon.variable} ${cormorant.variable}`}>
      <body className="flex min-h-svh flex-col">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
