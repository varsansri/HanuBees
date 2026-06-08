import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hanubees Business",
  description: "Run your AI receptionist — train it, see conversations, grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
