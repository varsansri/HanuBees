import type { MetadataRoute } from "next";

// Makes Hanubees installable as an app ("Add to Home Screen") — no app store needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hanubees — your business, answered by AI",
    short_name: "Hanubees",
    description: "Give your business its own AI receptionist. Find and connect with local agents.",
    start_url: "/chat",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121212",
    theme_color: "#121212",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
