import type { Metadata } from "next";
import { api } from "@/lib/api";
import { container } from "@/lib/ui";
import type { CountrySummary } from "@/lib/types";
import { CountryCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { API_DOWN, ErrorNotice, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Countries",
  description: "Travel guides to African countries: top destinations, culture, food, the best time to visit, budgets and safety.",
  alternates: { canonical: "/countries" },
};

const REGION_ORDER = ["Central", "East", "West", "Southern", "North", "Indian Ocean"];
const regionName = (r: string) => (r === "Indian Ocean" ? "Indian Ocean islands" : `${r} Africa`);

export default async function CountriesPage() {
  let countries: CountrySummary[] | null = null;
  try {
    countries = await api.countries();
  } catch {
    // handled below
  }
  if (!countries) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="Countries are unavailable" body={API_DOWN} />
      </div>
    );
  }

  const regions = new Map<string, CountrySummary[]>();
  for (const c of countries) regions.set(c.africaRegion, [...(regions.get(c.africaRegion) ?? []), c]);
  const ordered = [...regions.entries()].sort((a, b) => {
    const ia = REGION_ORDER.indexOf(a[0]);
    const ib = REGION_ORDER.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div className={`${container} pt-10`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Countries</h1>
        <p className="mt-3 text-lg text-muted">
          {countries.length} countries to explore. Start with one and discover its landscapes, food and people.
        </p>
      </header>
      <div className="mt-12 space-y-16">
        {ordered.map(([region, list]) => (
          <Reveal as="section" key={region}>
            <SectionHeading title={regionName(region)} subtitle={`${list.length} ${list.length === 1 ? "country" : "countries"}`} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((c) => (
                <CountryCard key={c.slug} c={c} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
