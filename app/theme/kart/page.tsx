import type { Metadata } from "next";
import { KartHome } from "@/components/theme/kart-home";
import "./theme.css";

export const metadata: Metadata = {
  title: "Kart — marketplace storefront theme",
  description:
    "Hanubees Kart: a full-page fashion marketplace storefront theme with a peeking hero carousel, bestseller rail, campaign banners, and category tiles.",
  alternates: { canonical: "/theme/kart" },
  openGraph: {
    title: "Hanubees Kart theme",
    description: "A fashion marketplace storefront layout, built from scratch.",
    url: "/theme/kart",
  },
};

export default function KartThemePage() {
  return <KartHome />;
}
