import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { shoots } from "@/content/shoots";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/portfolio", "/services", "/founders", "/about", "/contact", "/book"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const, priority: p ? 0.8 : 1 })),
    ...shoots.map((s) => ({ url: `${site.url}/portfolio/${s.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
