import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unruled — Streetwear storefront",
  description: "An original editable storefront theme by Hanubees.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
