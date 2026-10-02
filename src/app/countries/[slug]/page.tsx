import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { destinationHref, isoNumeric, placeLine, photoUrl } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import { AfricaMap } from "@/components/AfricaMap";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { DestinationCard, ExperienceCard } from "@/components/cards";
import { API_DOWN, Breadcrumbs, ErrorNotice, SectionHeading } from "@/components/ui";
import { CalendarIcon, ClockIcon, GlobeIcon, WalletIcon } from "@/components/icons";

type Props = PageProps<"/countries/[slug]">;

async function load(slug: string) {
  try {
    return { c: await api.country(slug), down: false };
  } catch {
    return { c: null, down: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { c } = await load(slug);
  if (!c) return { title: "Country" };
  return {
    title: `Travel guide to ${c.name}`,
    description: `${c.tagline} Top destinations, culture, food, the best time to visit and budgets for ${c.name}.`,
    alternates: { canonical: `/countries/${c.slug}` },
    openGraph: { images: c.image ? [{ url: photoUrl(c.image.url, 1280), alt: c.image.alt }] : undefined },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const { c, down } = await load(slug);
  if (down) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="This country guide is unavailable" body={API_DOWN} />
      </div>
    );
  }
  if (!c) notFound();

  const top = [...c.destinations].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const facts = [
    { icon: <CalendarIcon size={18} />, label: "Best time to visit", value: c.bestTimeToVisit },
    { icon: <ClockIcon size={18} />, label: "Recommended trip", value: c.recommendedDuration },
    { icon: <WalletIcon size={18} />, label: "Average budget", value: c.budget },
    { icon: <GlobeIcon size={18} />, label: "Capital", value: c.capital },
  ].filter((f) => f.value);

  return (
    <article>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#13241b] text-white">
        <Photo image={c.image} alt={c.name} sizes="100vw" priority credit className="absolute inset-0 -z-10 size-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/20" aria-hidden />
        <div className={`${container} flex min-h-[26rem] flex-col justify-end pt-24 pb-12 sm:min-h-[32rem]`}>
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/countries", label: "Countries" },
              { label: c.name },
            ]}
          />
          <p className="mt-6 text-5xl" aria-hidden>
            {c.flag}
          </p>
          <h1 className="mt-2 text-5xl !text-white sm:text-6xl">{c.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{c.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/explore?country=${c.slug}`} className={btn.accent}>
              Explore {c.destinationCount} destinations
            </Link>
            <Link href="#map" className="inline-flex items-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              View on map
            </Link>
          </div>
        </div>
      </section>

      <div className={`${container} mt-12 space-y-16`}>
        {/* Intro + facts */}
        <section className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="text-2xl sm:text-3xl">Welcome to {c.name}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/90">{c.intro}</p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {c.currency && (
                <div>
                  <dt className="text-muted">Currency</dt>
                  <dd className="font-semibold text-heading">{c.currency}</dd>
                </div>
              )}
              {c.languages && c.languages.length > 0 && (
                <div>
                  <dt className="text-muted">Languages</dt>
                  <dd className="font-semibold text-heading">{c.languages.join(", ")}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Region</dt>
                <dd className="font-semibold text-heading">{c.africaRegion === "Indian Ocean" ? "Indian Ocean" : `${c.africaRegion} Africa`}</dd>
              </div>
            </dl>
          </div>
          <dl className="space-y-3 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-3">
                <span className="mt-0.5 text-primary" aria-hidden>
                  {f.icon}
                </span>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{f.label}</dt>
                  <dd className="text-sm text-heading">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {top.length > 0 && (
          <Reveal as="section">
            <SectionHeading title="Top attractions" subtitle={`The highest-rated places in ${c.name}.`} />
            <ol className="grid gap-4 md:grid-cols-2">
              {top.map((d, i) => (
                <li key={d.slug}>
                  <Link href={destinationHref(d)} className="group flex gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-primary/40">
                    <Photo image={d.image} alt={d.name} sizes="160px" className="aspect-square w-28 shrink-0 rounded-xl" imgClassName="transition-transform duration-500 group-hover:scale-105" placeholderEmoji={d.category.emoji} />
                    <div className="min-w-0 py-1">
                      <p className="font-[family-name:var(--font-display)] text-3xl leading-none text-accent">{i + 1}</p>
                      <h3 className="mt-1 font-[family-name:var(--font-sans)] text-lg font-bold tracking-normal">{d.name}</h3>
                      <p className="text-sm text-muted">{placeLine(d)}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/80">{d.summary}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <Reveal as="section">
          <SectionHeading title={`Destinations in ${c.name}`} action={{ href: `/explore?country=${c.slug}`, label: "Filter and sort →" }} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {c.destinations.slice(0, 12).map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </Reveal>

        {c.experiences.length > 0 && (
          <Reveal as="section">
            <SectionHeading title="Experiences" subtitle={`Ways to experience ${c.name}.`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {c.experiences.slice(0, 8).map((e) => (
                <ExperienceCard key={e.slug} e={e} />
              ))}
            </div>
          </Reveal>
        )}

        {c.cities.length > 0 && (
          <Reveal as="section">
            <SectionHeading title="Cities and towns" />
            <ul className="flex flex-wrap gap-2">
              {c.cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/explore?country=${c.slug}&near=${city.location.lat},${city.location.lng}&nearLabel=${encodeURIComponent(city.name)}&radius=100&sort=nearest`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-primary/40"
                  >
                    {city.popular && <span className="text-accent" aria-label="Popular">★</span>}
                    {city.name}
                    {city.region && <span className="font-normal text-muted">{city.region}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {c.cuisine && c.cuisine.length > 0 && (
            <Reveal as="section" className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-2xl">🍽️ Local cuisine</h2>
              <ul className="mt-4 space-y-4">
                {c.cuisine.map((dish) => (
                  <li key={dish.name}>
                    <p className="font-semibold text-heading">{dish.name}</p>
                    <p className="text-sm text-ink/80">{dish.description}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {c.culture && (
            <Reveal as="section" className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-2xl">🎭 Culture</h2>
              <p className="mt-4 leading-relaxed text-ink/85">{c.culture}</p>
            </Reveal>
          )}
          {c.travelTips && c.travelTips.length > 0 && (
            <Reveal as="section" className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-2xl">🧭 Travel tips</h2>
              <ul className="mt-4 space-y-2">
                {c.travelTips.map((t) => (
                  <li key={t} className="flex gap-2 text-sm">
                    <span className="text-primary" aria-hidden>
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {c.safety && (
            <Reveal as="section" className="rounded-2xl border border-accent/40 bg-accent-soft p-6 text-accent-ink">
              <h2 className="text-2xl !text-accent-ink">🛡️ Safety</h2>
              <p className="mt-4 leading-relaxed">{c.safety}</p>
            </Reveal>
          )}
        </div>

        <Reveal as="section">
          <div id="map" className="scroll-mt-24">
            <SectionHeading title={`Map of ${c.name}`} />
            <AfricaMap
              points={c.destinations.map((d) => ({
                id: d.slug,
                lat: d.location.lat,
                lng: d.location.lng,
                label: d.name,
                sublabel: placeLine(d),
                href: destinationHref(d),
                emoji: d.category.emoji,
                group: "destination" as const,
              }))}
              fitToPoints
              highlightCountry={isoNumeric[c.isoCode]}
              className="aspect-[4/3] sm:aspect-[16/9]"
              ariaLabel={`Map of destinations in ${c.name}`}
            />
          </div>
        </Reveal>

        {c.articles.length > 0 && (
          <section>
            <SectionHeading title="Read before you go" />
            <ul className="grid gap-3 md:grid-cols-2">
              {c.articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/guide/${a.slug}`} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-primary/40">
                    <span className="text-2xl" aria-hidden>
                      {a.emoji}
                    </span>
                    <span>
                      <span className="block font-semibold text-heading">{a.title}</span>
                      <span className="block text-sm text-muted">{a.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
