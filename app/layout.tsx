import type { Metadata, Viewport } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#f5f3ec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Hanubees — Websites worth remembering",
    template: "%s | Hanubees",
  },
  description:
    "Hanubees is a web design and development studio building distinct websites, Shopify experiences, and a free library of production-ready interface ideas.",
  metadataBase: new URL("https://www.hanubees.com"),
  applicationName: "Hanubees",
  alternates: { canonical: "/" },
  keywords: [
    "web design studio",
    "Shopify development",
    "website development company",
    "Shopify design inspiration",
    "web design components",
  ],
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: {
    title: "Hanubees — Websites worth remembering",
    description:
      "A web design and development studio with a public lab of production-ready interface ideas.",
    url: "https://www.hanubees.com",
    siteName: "Hanubees",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hanubees — Websites worth remembering",
    description:
      "Websites, Shopify experiences, and a free interface design library.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
