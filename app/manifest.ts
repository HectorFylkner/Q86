import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Q86 — GMAT Quant Training",
    short_name: "Q86",
    description:
      "Personal GMAT Focus quant training: drills, timed sections, spaced redo, honest analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#FAFAF7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
