import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hanubees — Crafted with Purpose",
  description: "Hanubees.com — where creativity meets precision.",
  metadataBase: new URL("https://hanubees.com"),
  openGraph: {
    title: "Hanubees",
    description: "Hanubees.com — where creativity meets precision.",
    url: "https://hanubees.com",
    siteName: "Hanubees",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanubees",
    description: "Hanubees.com — where creativity meets precision.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%", margin: 0 }}>{children}</body>
    </html>
  );
}
