export type ThemeItem = {
  slug: string;
  number: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  stack: string;
  sections: string[];
  highlights: string[];
  accent: string;
};

export const themes: ThemeItem[] = [
  {
    slug: "kart",
    number: "01",
    name: "Kart",
    tagline: "High-density marketplace storefront",
    category: "Commerce theme",
    description:
      "A full fashion-marketplace homepage built the way high-volume Indian retail actually works: promo bars, a peeking campaign carousel, dense product rails, and category tiles that keep merchandising in charge.",
    stack: "Next.js · React · Plain CSS",
    sections: [
      "Utility + sticky masthead",
      "Peeking hero carousel",
      "Promo code strip",
      "Bestseller rail",
      "Campaign banner carousel",
      "Offer banner",
      "Category tiles",
      "Product grid + footer",
    ],
    highlights: [
      "Eleven merchandising slots, all driven by one data file",
      "Zero image dependencies — placeholder art is CSS and SVG",
      "Responsive from 1440 down to a two-up mobile grid",
    ],
    accent: "amber",
  },
];

export const themesInProgress = [
  {
    title: "Ledger",
    description:
      "A quiet, type-led storefront for single-product brands where the story does the selling.",
    status: "In progress",
    tone: "blue",
  },
  {
    title: "Counter",
    description:
      "A booking-first theme for studios, salons, and clinics — availability above the fold.",
    status: "In progress",
    tone: "green",
  },
  {
    title: "Broadsheet",
    description:
      "An editorial publishing theme with long-form layouts and commerce woven through.",
    status: "Planned",
    tone: "violet",
  },
] as const;

export function getTheme(slug: string) {
  return themes.find((theme) => theme.slug === slug);
}
