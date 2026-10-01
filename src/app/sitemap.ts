import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import { destinationHref } from "@/lib/format";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/explore", "/destinations", "/countries", "/experiences", "/map", "/guide", "/about"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  try {
    const [destinations, countries, experiences, articles] = await Promise.all([
      api.destinations({ limit: 200 }),
      api.countries(),
      api.experiences(),
      api.articles(),
    ]);
    return [
      ...pages,
      ...countries.map((c) => ({ url: `${SITE_URL}/countries/${c.slug}`, priority: 0.7 })),
      ...destinations.data.map((d) => ({ url: `${SITE_URL}${destinationHref(d)}`, priority: 0.7 })),
      ...experiences.map((e) => ({ url: `${SITE_URL}/experiences/${e.slug}`, priority: 0.6 })),
      ...articles.map((a) => ({ url: `${SITE_URL}/guide/${a.slug}`, lastModified: a.publishedAt, priority: 0.5 })),
    ];
  } catch {
    return pages; // backend offline: still list the main pages
  }
}
