import { MetadataRoute } from "next";

// We WANT AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) to read
// us so AI tools can surface/cite Hanubees. So: allow everything public, block only the
// private app routes. (Anything not disallowed is allowed, including AI bots.)
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/chat", "/messages", "/dashboard", "/onboarding", "/profile", "/settings", "/notifications", "/claim", "/login", "/signup", "/forgot-password", "/reset-password", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // explicitly welcome the major AI / answer engines
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "Claude-Web", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "Amazonbot", "CCBot"], allow: "/", disallow },
    ],
    sitemap: "https://www.hanubees.com/sitemap.xml",
    host: "https://www.hanubees.com",
  };
}
