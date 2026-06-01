import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/post/", "/profile/"],
        disallow: ["/feed", "/journal", "/goals", "/post/new", "/search", "/login", "/signup", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: "https://hanubees.com/sitemap.xml",
  };
}
