import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: posts }, { data: profiles }] = await Promise.all([
    supabase.from("posts").select("id, created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("profiles").select("username, created_at").limit(1000),
  ]);

  const postUrls: MetadataRoute.Sitemap = (posts || []).map(p => ({
    url: `https://hanubees.com/post/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const profileUrls: MetadataRoute.Sitemap = (profiles || []).map(p => ({
    url: `https://hanubees.com/profile/${p.username}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    { url: "https://hanubees.com", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...postUrls,
    ...profileUrls,
  ];
}
