import type { MetadataRoute } from "next";
import { liquidGlassDesigns } from "@/lib/design-library";
import { themes } from "@/lib/theme-library";

const baseUrl = "https://www.hanubees.com";
const lastModified = new Date("2026-08-20");

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/design`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/design/liquid-glass-shopify`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/design/unruled-streetwear-storefront`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const themePages: MetadataRoute.Sitemap = themes.map((theme) => ({
    url: `${baseUrl}/theme/${theme.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const designPages: MetadataRoute.Sitemap = liquidGlassDesigns.map((design) => ({
    url: `${baseUrl}/design/${design.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...corePages, ...themePages, ...designPages];
}
