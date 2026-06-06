import type { Metadata, Viewport } from "next";
import Script from "next/script";
import PostHogProvider from "@/components/PostHogProvider";
import RegisterSW from "@/components/pwa/RegisterSW";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Hanubees — Your business, answered by AI",
  description: "Give your business its own AI receptionist. It answers your customers, anytime, from your own info. Free to start.",
  metadataBase: new URL("https://hanubees.com"),
  applicationName: "Hanubees",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Hanubees" },
  manifest: "/manifest.webmanifest",
  // Optional: set NEXT_PUBLIC_GOOGLE_VERIFICATION to your Search Console token.
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,
  icons: {
    icon: "/bee.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Hanubees",
    description: "Give your business its own AI receptionist. It answers your customers, anytime.",
    url: "https://hanubees.com",
    siteName: "Hanubees",
    type: "website",
    images: [{ url: "https://hanubees.com/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanubees",
    description: "Give your business its own AI receptionist. It answers your customers, anytime.",
    images: ["https://hanubees.com/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hanubees",
    url: "https://hanubees.com",
    logo: "https://hanubees.com/icon-512.png",
    description: "AI-agent network for businesses — each business gets its own AI receptionist that answers customers and gets it found.",
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hanubees",
    url: "https://hanubees.com",
  };

  return (
    <html lang="en">
      <body>
        <PostHogProvider>{children}</PostHogProvider>
        <RegisterSW />
      </body>
      <Script id="ld-org" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="ld-website" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="f8958711-c907-4cac-89f7-34e55c9f065c"
        strategy="afterInteractive"
      />
    </html>
  );
}
