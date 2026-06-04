import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/chat", "/messages", "/dashboard", "/onboarding", "/profile", "/settings", "/login", "/signup", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: "https://hanubees.com/sitemap.xml",
  };
}
