import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CITIES, CATEGORIES } from "@/lib/seo/registry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: accounts } = await supabase
    .from("accounts")
    .select("slug, created_at")
    .order("created_at", { ascending: false })
    .limit(20000);

  const now = new Date();

  // Business pages
  const accountUrls: MetadataRoute.Sitemap = (accounts || []).map((a) => ({
    url: `https://www.hanubees.com/${a.slug}`,
    lastModified: new Date(a.created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Programmatic SEO: city hubs + city × category pages
  const cityUrls: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `https://www.hanubees.com/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));
  const cityCategoryUrls: MetadataRoute.Sitemap = [];
  for (const city of CITIES) {
    for (const cat of CATEGORIES) {
      cityCategoryUrls.push({
        url: `https://www.hanubees.com/${city.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return [
    { url: "https://www.hanubees.com", lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: "https://www.hanubees.com/discover", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...cityUrls,
    ...cityCategoryUrls,
    ...accountUrls,
  ];
}
