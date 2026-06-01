import type { Metadata } from "next";
import Script from "next/script";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hanubees — Health & Wellness Community",
  description: "Journal your health journey. Share your experience. Find people who understand.",
  metadataBase: new URL("https://hanubees.com"),
  icons: {
    icon: "/bee.png",
    apple: "/bee.png",
  },
  openGraph: {
    title: "Hanubees",
    description: "Journal your health journey. Share your experience. Find people who understand.",
    url: "https://hanubees.com",
    siteName: "Hanubees",
    type: "website",
    images: [{ url: "https://hanubees.com/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanubees",
    description: "Journal your health journey. Share your experience. Find people who understand.",
    images: ["https://hanubees.com/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><PostHogProvider>{children}</PostHogProvider></body>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="f8958711-c907-4cac-89f7-34e55c9f065c"
        strategy="afterInteractive"
      />
    </html>
  );
}
