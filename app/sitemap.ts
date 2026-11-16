import type { MetadataRoute } from "next";
import { projects } from "@/content/content";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({ url: `${site}/projects/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
