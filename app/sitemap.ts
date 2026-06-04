import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: accounts } = await supabase
    .from("accounts")
    .select("slug, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  const accountUrls: MetadataRoute.Sitemap = (accounts || []).map(a => ({
    url: `https://hanubees.com/${a.slug}`,
    lastModified: new Date(a.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: "https://hanubees.com", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...accountUrls,
  ];
}
