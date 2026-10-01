import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { btn, container } from "@/lib/ui";
import type { DestinationCard as Dest } from "@/lib/types";
import { DestinationCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { API_DOWN, ErrorNotice, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Every destination on Africa Discover, country by country: mountains, beaches, waterfalls, wildlife parks, historic sites and cities.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  let all: Dest[] | null = null;
  try {
    all = (await api.destinations({ sort: "popular", limit: 200 })).data;
  } catch {
    // handled below
  }

  if (!all) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="Destinations are unavailable" body={API_DOWN} />
      </div>
    );
  }

  const byCountry = new Map<string, { country: Dest["country"]; items: Dest[] }>();
  for (const d of all) {
    const g = byCountry.get(d.country.slug) ?? { country: d.country, items: [] };
    g.items.push(d);
    byCountry.set(d.country.slug, g);
  }
  const groups = [...byCountry.values()].sort((a, b) => b.items.length - a.items.length);

  return (
    <div className={`${container} pt-10`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Destinations</h1>
        <p className="mt-3 text-lg text-muted">
          {all.length} places across {groups.length} countries, from volcano summits to quiet fishing villages.
        </p>
      </header>

      <nav aria-label="Jump to a country" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {groups.map((g) => (
          <a key={g.country.slug} href={`#${g.country.slug}`} className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-primary/40">
            {g.country.flag} {g.country.name} <span className="text-muted">{g.items.length}</span>
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        {groups.map((g) => (
          <Reveal as="section" key={g.country.slug}>
            <div id={g.country.slug} className="scroll-mt-24">
              <SectionHeading
                title={`${g.country.flag} ${g.country.name}`}
                subtitle={`${g.items.length} ${g.items.length === 1 ? "destination" : "destinations"}`}
                action={{ href: `/countries/${g.country.slug}`, label: `Discover ${g.country.name} →` }}
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.items.slice(0, 8).map((d) => (
                  <DestinationCard key={d.slug} d={d} />
                ))}
              </div>
              {g.items.length > 8 && (
                <div className="mt-6">
                  <Link href={`/explore?country=${g.country.slug}`} className={btn.secondary}>
                    See all {g.items.length} in {g.country.name}
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
