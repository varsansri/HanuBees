import type { MetadataRoute } from "next";

// Makes Annam installable ("Add to Home Screen") — snap food, get calories, no app store.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Annam — AI calorie counter for Indian food",
    short_name: "Annam",
    description: "Snap your Indian plate and instantly get calories, protein, carbs, fiber and fat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8f0",
    theme_color: "#ff7a18",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
