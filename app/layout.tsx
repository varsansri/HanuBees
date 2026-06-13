import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ff7a18",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Hanubees — AI calorie counter for Indian food",
  description:
    "Snap a photo of your Indian plate — idli, poha, sambar, chutney, dal, sabzi — and instantly get calories, protein, carbs, fiber and fat. Built for Indian food.",
  metadataBase: new URL("https://www.hanubees.com"),
  applicationName: "Hanubees",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Hanubees" },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  openGraph: {
    title: "Hanubees — Snap your plate, know your macros",
    description:
      "AI calorie counter built for Indian food. Photo in, full nutrition out.",
    url: "https://www.hanubees.com",
    siteName: "Hanubees",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanubees — AI calorie counter for Indian food",
    description: "Snap your plate, know your macros. Built for Indian food.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
