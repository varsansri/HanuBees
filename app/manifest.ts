import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hanubees — AI calorie counter for Indian food",
    short_name: "Hanubees",
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
