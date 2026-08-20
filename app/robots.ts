import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: "https://www.hanubees.com/sitemap.xml",
    host: "https://www.hanubees.com",
  };
}
