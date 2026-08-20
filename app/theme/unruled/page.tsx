import type { Metadata } from "next";
import { UnruledHome } from "@/components/theme/unruled-home";
import "./theme.css";

export const metadata: Metadata = {
  title: "Unruled - monochrome streetwear storefront theme",
  description:
    "Unruled is an original monochrome fashion storefront with kinetic type, editorial storytelling, product quick-view, responsive motion, and a complete shoppable homepage.",
  alternates: { canonical: "/theme/unruled" },
  openGraph: {
    title: "Unruled storefront theme by Hanubees",
    description:
      "A cinematic streetwear storefront with original campaign photography and smooth, accessible interactions.",
    url: "/theme/unruled",
    images: [
      {
        url: "/themes/unruled/hero-campaign.png",
        width: 1536,
        height: 1024,
        alt: "Unruled monochrome streetwear campaign",
      },
    ],
  },
};

export default function UnruledThemePage() {
  return <UnruledHome />;
}
