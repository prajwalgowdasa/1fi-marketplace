import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "1Fi Marketplace",
    short_name: "1Fi Market",
    start_url: "/shop?tab=marketplace",
    display: "standalone",
    theme_color: "#712CDC",
    background_color: "#F7F7F7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
