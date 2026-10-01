import Link from "next/link";
import { api } from "@/lib/api";
import type { ArticleSummary, Category, CountrySummary, DestinationCard as Dest, ExperienceSummary, MapPoint } from "@/lib/types";
import { BRAND } from "@/lib/config";
import { btn, container } from "@/lib/ui";
import { destinationHref } from "@/lib/format";
import { SearchBox } from "@/components/SearchBox";
import { ExploreNearYou, HeroLocationButton, type CityOption } from "@/components/ExploreNearYou";
import { ArticleCard, CountryCard, DestinationCard, ExperienceCard } from "@/components/cards";
import { AfricaMap } from "@/components/AfricaMap";
import { Reveal } from "@/components/Reveal";
import { API_DOWN, ErrorNotice, SectionHeading } from "@/components/ui";
import { Photo, PhotoCredit } from "@/components/Photo";

const NEAR_CITIES: CityOption[] = [
  { label: "Yaoundé", lat: 3.848, lng: 11.502 },
  { label: "Douala", lat: 4.0511, lng: 9.7679 },
  { label: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { label: "Arusha", lat: -3.3869, lng: 36.683 },
  { label: "Kigali", lat: -1.9441, lng: 30.0619 },
  { label: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { label: "Marrakech", lat: 31.6295, lng: -7.9811 },
  { label: "Cairo", lat: 30.0444, lng: 31.2357 },
  { label: "Accra", lat: 5.6037, lng: -0.187 },
  { label: "Lagos", lat: 6.5244, lng: 3.3792 },
  { label: "Dakar", lat: 14.7167, lng: -17.4677 },
  { label: "Windhoek", lat: -22.5609, lng: 17.0658 },
];

const POPULAR_SEARCHES = ["Waterfalls near Douala", "Beaches in Cameroon", "Things to do in Nairobi", "Gorillas", "Safari in Tanzania"];

async function load() {
  const [featured, countries, experiences, categories, articles, mapPoints] = await Promise.all([
    api.destinations({ featured: true, limit: 8 }),
    api.countries({ featured: true }),
    api.experiences(),
    api.categories(),
    api.articles("tips"),
    api.map({ layers: "destinations" }),
  ]);
  return { featured: featured.data, countries, experiences, categories, articles, mapPoints };
}

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof load>> | null = null;
  try {
    data = await load();
  } catch {
    data = null;
  }
  // Hero photo: the most popular featured destination that has a photo
  const hero = data?.featured.find((d) => d.image) ?? null;

  return (
    <>
      <Hero hero={hero} />

      <div className={`${container} space-y-20 pt-16 sm:space-y-24`}>
        {!data && <ErrorNotice title="Destinations are unavailable" body={API_DOWN} />}

        <Reveal as="section">
          <ExploreNearYou cities={NEAR_CITIES} />
        </Reveal>

        {data && (
          <>
            <Reveal as="section">
              <Categories categories={data.categories} />
            </Reveal>
            <Reveal as="section">
              <FeaturedDestinations items={data.featured} />
            </Reveal>
            <Reveal as="section">
              <Countries items={data.countries} />
            </Reveal>
            <Reveal as="section">
              <Experiences items={data.experiences} />
            </Reveal>
            <Reveal as="section">
              <MapTeaser points={data.mapPoints} />
            </Reveal>
            <Reveal as="section">
              <Guide items={data.articles} />
            </Reveal>
          </>
        )}

        <Reveal as="section">
          <PlanCta />
        </Reveal>
      </div>
    </>
  );
}

function Hero({ hero }: { hero: Dest | null }) {
  return (
    <section className="relative isolate -mt-px overflow-hidden bg-[#163626]" aria-labelledby="hero-title">
      {hero?.image && (
        <Photo image={hero.image} alt={hero.name} sizes="100vw" priority className="absolute inset-0 -z-10" imgClassName="scale-105" />
      )}
      {/* Darkens the photo so the white text is always readable */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(10_20_14/0.35)_0%,rgb(10_20_14/0.55)_55%,rgb(10_20_14/0.85)_100%)]" />
      <div className={`${container} flex min-h-[78svh] flex-col justify-end pt-32 pb-14 sm:min-h-[86svh] sm:pb-20`}>
        <div className="max-w-3xl animate-fade-up">
          <h1 id="hero-title" className="text-[2.6rem] leading-[1.02] !text-white sm:text-6xl lg:text-7xl">
            Discover Africa. Experience the Extraordinary.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
            Explore breathtaking destinations, unforgettable experiences, rich cultures, wildlife, beaches and hidden gems across Africa.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBox size="lg" />
            <HeroLocationButton />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Popular searches">
            {POPULAR_SEARCHES.map((s) => (
              <li key={s}>
                <Link
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="inline-block rounded-full border border-white/30 px-3.5 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/15"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {hero?.image?.credit && (
        <div className="absolute right-0 bottom-0 flex items-center gap-2">
          <Link href={destinationHref(hero)} className="hidden rounded-tl-md bg-black/50 px-2 py-0.5 text-[11px] text-white/90 underline sm:block">
            {hero.name}, {hero.country.name}
          </Link>
          <PhotoCredit image={hero.image} className="relative" />
        </div>
      )}
    </section>
  );
}

function Categories({ categories }: { categories: Category[] }) {
  return (
    <>
      <SectionHeading title="What do you want to explore?" subtitle="Pick an interest to see destinations across Africa." />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[...categories, { slug: "hotels", name: "Hotels", emoji: "🏨", destinationCount: undefined }].map((c) => (
          <li key={c.slug}>
            <Link
              href={c.slug === "hotels" ? "/explore?category=hotels" : `/explore?category=${c.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-sand"
            >
              <span className="text-2xl" aria-hidden>
                {c.emoji}
              </span>
              <span>
                <span className="block font-semibold text-heading">{c.name}</span>
                {c.destinationCount !== undefined && <span className="block text-xs text-muted">{c.destinationCount} {c.destinationCount === 1 ? "place" : "places"}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function FeaturedDestinations({ items }: { items: Dest[] }) {
  return (
    <>
      <SectionHeading title="Featured destinations" subtitle="Travellers' favourites, from volcano summits to island beaches." action={{ href: "/explore", label: "See all destinations" }} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((d) => (
          <DestinationCard key={d.slug} d={d} />
        ))}
      </div>
    </>
  );
}

function Countries({ items }: { items: CountrySummary[] }) {
  return (
    <>
      <SectionHeading title="Explore Africa by country" subtitle="Start with Cameroon, our most detailed guide, or wherever your heart is set." action={{ href: "/countries", label: "All countries" }} />
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((c) => (
          <div key={c.slug} className="w-[72%] shrink-0 snap-start sm:w-[38%] lg:w-[23%]">
            <CountryCard c={c} />
          </div>
        ))}
      </div>
    </>
  );
}

function Experiences({ items }: { items: ExperienceSummary[] }) {
  return (
    <>
      <SectionHeading title="Unforgettable experiences" subtitle="Safaris, summits, beaches and culture: choose how you want to feel." action={{ href: "/experiences", label: "All experiences" }} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((e) => (
          <ExperienceCard key={e.slug} e={e} />
        ))}
      </div>
    </>
  );
}

function MapTeaser({ points }: { points: MapPoint[] }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h2 className="text-2xl sm:text-3xl">See it all on the map</h2>
        <p className="mt-3 max-w-md text-muted">
          {points.length} destinations across Africa, with hotels, restaurants, markets and airports nearby. Tap a marker to explore.
        </p>
        <Link href="/map" className={`${btn.primary} mt-6`}>
          Open the map
        </Link>
      </div>
      <AfricaMap
        className="aspect-[1000/760]"
        ariaLabel={`Map of Africa with ${points.length} destinations`}
        points={points.map((p) => ({
          id: p.slug,
          lat: p.location.lat,
          lng: p.location.lng,
          label: p.name,
          sublabel: p.country,
          emoji: p.emoji,
          group: "destination",
          href: `/destinations/${p.countrySlug}/${p.slug}`,
        }))}
      />
    </div>
  );
}

function Guide({ items }: { items: ArticleSummary[] }) {
  return (
    <>
      <SectionHeading title="Travel guide" subtitle="Practical advice before you go." action={{ href: "/guide", label: "Read the guide" }} />
      <div className="grid gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((a) => (
          <ArticleCard key={a.slug} a={a} />
        ))}
      </div>
    </>
  );
}

function PlanCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-ink sm:px-12 sm:py-16">
      <svg aria-hidden viewBox="0 0 400 200" className="absolute -right-10 -bottom-10 w-[28rem] opacity-15">
        <circle cx="300" cy="80" r="60" fill="currentColor" />
        <path d="M0 200 120 60l70 90 50-60 160 110Z" fill="currentColor" />
      </svg>
      <div className="relative max-w-xl">
        <h2 className="text-3xl !text-primary-ink sm:text-4xl">Plan your African adventure</h2>
        <p className="mt-3 text-primary-ink/85">
          Save the places you love, build a day-by-day trip and see the route on the map. {BRAND.name} keeps it all in one place.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/trip" className="inline-flex items-center rounded-full bg-primary-ink px-5 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90">
            Start my trip
          </Link>
          <Link href="/explore" className="inline-flex items-center rounded-full border border-primary-ink/40 px-5 py-2.5 text-sm font-semibold text-primary-ink hover:bg-primary-ink/10">
            Explore destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
