import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { readFilters, withParam } from "@/lib/search-params";
import { btn, container } from "@/lib/ui";
import { DestinationCard, PlaceCard } from "@/components/cards";
import { FilterPanel, SortSelect, type FilterOptions } from "@/components/FilterPanel";
import { API_DOWN, EmptyState, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Explore Africa",
  description: "Filter Africa's best destinations by country, interest, distance, rating, price, activity and the best time to visit.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const sp = await searchParams;
  const { values, query, nearLabel, page } = readFilters(sp);
  const showHotels = values.category === "hotels";

  let options: FilterOptions | null = null;
  let results: Awaited<ReturnType<typeof api.destinations>> | null = null;
  let hotels: Awaited<ReturnType<typeof api.places>> = [];
  try {
    const [countries, categories, activities] = await Promise.all([api.countries(), api.categories(), api.activities()]);
    options = { countries, categories, activities };
    if (showHotels) hotels = await api.places({ kind: "hotel", country: values.country, limit: 48 });
    else results = await api.destinations(query);
  } catch {
    // handled below
  }

  return (
    <div className={`${container} pt-10 pb-6`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Explore Africa</h1>
        <p className="mt-3 text-lg text-muted">Find your next unforgettable adventure.</p>
      </header>

      {!options ? (
        <div className="mt-10">
          <ErrorNotice title="Destinations are unavailable" body={API_DOWN} />
        </div>
      ) : (
        <>
          {/* Category shortcuts */}
          <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <CategoryLink sp={sp} slug={null} label="All" active={!values.category} />
            {options.categories.map((c) => (
              <CategoryLink key={c.slug} sp={sp} slug={c.slug} label={`${c.emoji} ${c.name}`} active={values.category === c.slug} />
            ))}
            <CategoryLink sp={sp} slug="hotels" label="🏨 Hotels" active={showHotels} />
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr]">
            <FilterPanel options={options} values={values} />

            <section aria-labelledby="results-heading">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 id="results-heading" className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal text-muted">
                  {showHotels
                    ? `${hotels.length} hotels`
                    : `${results?.total ?? 0} ${results?.total === 1 ? "destination" : "destinations"}${query.near && nearLabel ? ` near ${nearLabel}` : ""}`}
                </h2>
                {!showHotels && <SortSelect value={values.sort ?? "recommended"} />}
              </div>

              {showHotels ? (
                hotels.length ? (
                  <>
                    <p className="mb-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-ink">
                      Hotels marked “Demo listing” are fictional examples until real hotels join Africa Discover.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {hotels.map((p) => (
                        <PlaceCard key={p.slug} p={p} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState emoji="🏨" title="No hotels listed here yet" body="Try another country, or explore destinations instead." />
                )
              ) : results && results.data.length ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {results.data.map((d, i) => (
                      <DestinationCard key={d.slug} d={d} priority={i < 3} />
                    ))}
                  </div>
                  {results.total > results.data.length && (
                    <div className="mt-10 flex justify-center">
                      <Link href={withParam(sp, "page", String(page + 1))} scroll={false} className={btn.secondary}>
                        Show more destinations
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  emoji="🔎"
                  title="No destinations match these filters"
                  body="Try removing a filter or widening the distance."
                  action={
                    <Link href="/explore" className={btn.primary}>
                      Clear all filters
                    </Link>
                  }
                />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryLink({ sp, slug, label, active }: { sp: Record<string, string | string[] | undefined>; slug: string | null; label: string; active: boolean }) {
  const href = withParam({ ...sp, page: undefined }, "category", slug);
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-heading hover:border-primary/40"
      }`}
    >
      {label}
    </Link>
  );
}
