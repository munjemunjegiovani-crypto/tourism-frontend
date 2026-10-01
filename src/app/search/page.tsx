import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { readFilters, withParam } from "@/lib/search-params";
import { btn, container } from "@/lib/ui";
import type { SearchResult } from "@/lib/types";
import { DestinationCard, PlaceCard } from "@/components/cards";
import { FilterPanel, SortSelect, type FilterOptions } from "@/components/FilterPanel";
import { SearchBox } from "@/components/SearchBox";
import { API_DOWN, EmptyState, ErrorNotice } from "@/components/ui";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const text = typeof q === "string" ? q.slice(0, 80) : "";
  return { title: text ? `“${text}”` : "Search", robots: { index: false } };
}

const POPULAR = ["Waterfalls near Douala", "Beaches in Cameroon", "Things to do in Nairobi", "Safari in Kenya", "Mountains in Cameroon", "Marrakech"];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const { values, query, page } = readFilters(sp);
  const q = values.q ?? "";

  let options: FilterOptions | null = null;
  let result: SearchResult | null = null;
  try {
    const [countries, categories, activities] = await Promise.all([api.countries(), api.categories(), api.activities()]);
    options = { countries, categories, activities };
    if (q) result = await api.search({ ...query, q });
  } catch {
    // handled below
  }

  const i = result?.interpretation;
  return (
    <div className={`${container} pt-8`}>
      <div className="max-w-2xl">
        <h1 className="sr-only">Search results</h1>
        <SearchBox key={q} defaultValue={q} size="md" />
      </div>

      {!options ? (
        <div className="mt-10">
          <ErrorNotice title="Search is unavailable" body={API_DOWN} />
        </div>
      ) : !q ? (
        <div className="mt-10">
          <p className="text-lg font-semibold text-heading">Try searching for</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <li key={p}>
                <Link href={`/search?q=${encodeURIComponent(p)}`} className="inline-flex rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-primary/40">
                  {p}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <p className="text-2xl font-semibold text-heading" role="status">
              {result?.total ?? 0} {result?.total === 1 ? "result" : "results"} found for “{q}”
            </p>
            {describe(i) && <p className="mt-1 text-muted">Showing {describe(i)}.</p>}
            {i?.place && (
              <p className="mt-2 text-sm">
                {i.place.kind === "country" ? (
                  <Link href={`/countries/${i.place.slug}`} className="font-semibold text-primary hover:underline">
                    Read the {i.place.name} travel guide →
                  </Link>
                ) : i.place.kind === "destination" ? (
                  <Link href={`/destinations/${i.place.countrySlug}/${i.place.slug}`} className="font-semibold text-primary hover:underline">
                    Go to {i.place.name} →
                  </Link>
                ) : null}
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
            <FilterPanel options={options} values={values} keepQuery />
            <section aria-label="Results" className="min-w-0 space-y-12">
              {result && result.thingsToDo.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl">Things to do{i?.place ? ` in ${i.place.name}` : ""}</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {result.thingsToDo.map((t) => (
                      <li key={t.slug} className="rounded-2xl border border-line bg-surface p-4">
                        <p className="font-semibold text-heading">
                          <span aria-hidden>{t.emoji}</span> {t.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">{t.description}</p>
                        {t.destinations.length > 0 && (
                          <p className="mt-2 text-sm">
                            <span className="text-muted">Where: </span>
                            {t.destinations.map((d, n) => (
                              <span key={d.slug}>
                                {n > 0 && ", "}
                                <Link href={`/search?q=${encodeURIComponent(d.name)}`} className="font-semibold text-primary hover:underline">
                                  {d.name}
                                </Link>
                              </span>
                            ))}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl">Destinations</h2>
                  <SortSelect value={values.sort ?? "recommended"} />
                </div>
                {result && result.data.length ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {result.data.map((d, n) => (
                        <DestinationCard key={d.slug} d={d} priority={n < 3} />
                      ))}
                    </div>
                    {result.total > result.data.length && (
                      <div className="mt-10 flex justify-center">
                        <Link href={withParam(sp, "page", String(page + 1))} scroll={false} className={btn.secondary}>
                          Show more results
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    emoji="🧭"
                    title="No destinations found"
                    body="Check the spelling, remove a filter, or try a broader search like a country or a type of place."
                    action={
                      <Link href="/explore" className={btn.primary}>
                        Browse all destinations
                      </Link>
                    }
                  />
                )}
              </div>

              {result && result.places.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl">Hotels, restaurants and more</h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.places.map((p) => (
                      <PlaceCard key={p.slug} p={p} />
                    ))}
                  </div>
                  {result.places.some((p) => p.isDemo) && (
                    <p className="mt-3 text-xs text-muted">“Demo listing” places are fictional examples shown until real businesses join.</p>
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function describe(i: SearchResult["interpretation"] | undefined) {
  if (!i || (!i.type && !i.place)) return null;
  const what = i.intent === "things-to-do" ? "things to do" : (i.type?.label.toLowerCase() ?? "destinations");
  if (!i.place) return what;
  const rel = i.relation === "near" || i.place.kind !== "country" ? "near" : "in";
  return `${what} ${rel} ${i.place.name}`;
}
