import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { api } from "@/lib/api";
import { MONTHS, difficultyLabel, destinationHref, formatDate, initials, placeLine, photoUrl } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import type { DestinationDetail, Place } from "@/lib/types";
import { AfricaMap } from "@/components/AfricaMap";
import { DestinationActions, DistanceFromYou } from "@/components/DestinationActions";
import { Gallery } from "@/components/Gallery";
import { ReviewForm } from "@/components/ReviewForm";
import { Rating, Stars } from "@/components/Rating";
import { Reveal } from "@/components/Reveal";
import { ActivityCard, DestinationCard, PlaceCard } from "@/components/cards";
import { Breadcrumbs, ErrorNotice, API_DOWN, SectionHeading } from "@/components/ui";
import { CalendarIcon, ClockIcon, GaugeIcon, GlobeIcon, PinIcon, WalletIcon } from "@/components/icons";

type Props = PageProps<"/destinations/[country]/[slug]">;

async function load(slug: string) {
  try {
    return { d: await api.destination(slug), down: false };
  } catch {
    return { d: null, down: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { d } = await load(slug);
  if (!d) return { title: "Destination" };
  return {
    title: `${d.name}, ${d.country.name}`,
    description: d.summary,
    alternates: { canonical: destinationHref(d) },
    openGraph: { title: `${d.name} · Africa Discover`, description: d.summary, images: d.image ? [{ url: photoUrl(d.image.url, 1280), alt: d.image.alt }] : undefined },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { country, slug } = await params;
  const { d, down } = await load(slug);
  if (down) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="This destination is unavailable" body={API_DOWN} />
      </div>
    );
  }
  if (!d) notFound();
  if (d.country.slug !== country) permanentRedirect(destinationHref(d));

  const info: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    { icon: <PinIcon size={18} />, label: "Location", value: placeLine(d) },
    { icon: <GlobeIcon size={18} />, label: "Coordinates", value: `${d.location.lat.toFixed(4)}, ${d.location.lng.toFixed(4)}` },
    { icon: <PinIcon size={18} />, label: "Distance from you", value: <DistanceFromYou to={d.location} /> },
    { icon: <CalendarIcon size={18} />, label: "Best time to visit", value: d.bestTimeToVisit ?? "All year" },
    { icon: <ClockIcon size={18} />, label: "Recommended duration", value: d.recommendedDuration ?? "Half a day" },
    { icon: <WalletIcon size={18} />, label: "Budget", value: d.budget ?? d.priceRange ?? "Varies" },
    { icon: <GaugeIcon size={18} />, label: "Difficulty", value: d.difficulty ? difficultyLabel[d.difficulty] : "Easy" },
    { icon: <ClockIcon size={18} />, label: "Opening hours", value: d.openingHours ?? "Open access" },
  ];

  const mapPoints = [
    { id: `d-${d.slug}`, lat: d.location.lat, lng: d.location.lng, label: d.name, sublabel: placeLine(d), emoji: d.category.emoji, group: "destination" as const },
    ...d.nearbyDestinations.slice(0, 8).map((n) => ({
      id: `n-${n.slug}`,
      lat: n.location.lat,
      lng: n.location.lng,
      label: n.name,
      sublabel: placeLine(n),
      href: destinationHref(n),
      emoji: n.category.emoji,
      group: "destination" as const,
    })),
    ...placesForMap(d),
  ];

  return (
    <article>
      <div className={`${container} pt-6`}>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/destinations", label: "Destinations" },
            { href: `/countries/${d.country.slug}`, label: d.country.name },
            { label: d.name },
          ]}
        />
        <div className="mt-6">
          <Gallery images={d.images.length ? d.images : d.image ? [d.image] : []} name={d.name} emoji={d.category.emoji} />
        </div>

        {/* Title row */}
        <header className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href={`/explore?category=${d.category.slug}`} className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                {d.category.emoji} {d.category.name}
              </Link>
              <Link href={`/countries/${d.country.slug}`} className="rounded-full bg-sand px-3 py-1 font-semibold text-heading">
                {d.country.flag} {d.country.name}
              </Link>
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl">{d.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
              <span className="inline-flex items-center gap-1">
                <PinIcon size={16} /> {placeLine(d)}
              </span>
              {d.rating !== null && <Rating value={d.rating} count={d.reviewCount} />}
            </p>
          </div>
          <DestinationActions slug={d.slug} name={d.name} />
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-14">
            <section aria-labelledby="about">
              <h2 id="about" className="text-2xl sm:text-3xl">
                About {d.name}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink/90">{d.summary}</p>
              <div className="mt-4 space-y-4 leading-relaxed text-ink/85">
                {d.description.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {d.highlights.length > 0 && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {d.highlights.map((h) => (
                    <li key={h} className="flex gap-2 rounded-xl bg-sand px-4 py-3 text-sm">
                      <span className="text-accent" aria-hidden>
                        ✦
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {d.bestMonths && d.bestMonths.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-heading">Best months</p>
                  <ol className="mt-2 grid grid-cols-6 gap-1 sm:grid-cols-12" aria-label="Best months to visit">
                    {MONTHS.map((m, i) => {
                      const good = d.bestMonths!.includes(i + 1);
                      return (
                        <li
                          key={m}
                          className={`rounded-md py-1.5 text-center text-xs font-semibold ${good ? "bg-primary text-primary-ink" : "bg-sand text-muted"}`}
                          aria-label={`${m}: ${good ? "good time" : "less ideal"}`}
                        >
                          {m.slice(0, 3)}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </section>

            {d.activities.length > 0 && (
              <Reveal as="section">
                <SectionHeading title="Things to do" subtitle={`Experiences travellers enjoy at ${d.name}.`} />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {d.activities.map((a) => (
                    <ActivityCard key={a.slug} a={a} />
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal as="section">
              <SectionHeading title="Explore nearby" subtitle="Where to stay, eat, shop and get around, plus more places close by." />
              <NearbyGroups d={d} />
            </Reveal>

            <Reveal as="section">
              <SectionHeading title="On the map" />
              <AfricaMap points={mapPoints} fitToPoints className="aspect-[4/3] sm:aspect-[16/10]" ariaLabel={`Map of ${d.name} and nearby places`} />
            </Reveal>

            <Reveal as="section">
              <Reviews d={d} />
            </Reveal>
          </div>

          {/* Sticky info column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-[family-name:var(--font-sans)] text-lg font-bold tracking-normal">Travel information</h2>
              <dl className="mt-4 divide-y divide-line">
                {info.map((row) => (
                  <div key={row.label} className="flex gap-3 py-3">
                    <span className="mt-0.5 text-primary" aria-hidden>
                      {row.icon}
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{row.label}</dt>
                      <dd className="mt-0.5 text-sm text-heading">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <a
                href={`https://www.openstreetmap.org/directions?to=${d.location.lat}%2C${d.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn.secondary} mt-4 w-full`}
              >
                Get directions
              </a>
            </div>

            {d.experiences.length > 0 && (
              <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
                <h2 className="font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">Part of these experiences</h2>
                <ul className="mt-3 space-y-2">
                  {d.experiences.map((e) => (
                    <li key={e.slug}>
                      <Link href={`/experiences/${e.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-sand">
                        <span className="text-2xl" aria-hidden>
                          {e.emoji}
                        </span>
                        <span>
                          <span className="block font-semibold text-heading">{e.name}</span>
                          <span className="block text-xs text-muted">{e.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {d.countrySafety && (
              <div className="mt-5 rounded-2xl border border-accent/40 bg-accent-soft p-5 text-sm text-accent-ink">
                <h2 className="font-[family-name:var(--font-sans)] text-base font-bold tracking-normal text-accent-ink">Safety in {d.country.name}</h2>
                <p className="mt-2 leading-relaxed">{d.countrySafety}</p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {d.nearbyDestinations.length > 0 && (
        <section className={`${container} mt-16`} aria-labelledby="nearby-dest">
          <SectionHeading id="nearby-dest" title="Nearby attractions" subtitle={`More places within a few hours of ${d.name}.`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {d.nearbyDestinations.slice(0, 4).map((n) => (
              <DestinationCard key={n.slug} d={n} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function placesForMap(d: DestinationDetail) {
  const groups: [keyof DestinationDetail["nearbyPlaces"], "hotel" | "restaurant" | "shopping" | "transport"][] = [
    ["hotels", "hotel"],
    ["restaurants", "restaurant"],
    ["shopping", "shopping"],
    ["transport", "transport"],
  ];
  return groups.flatMap(([key, group]) =>
    d.nearbyPlaces[key]
      .filter((p): p is Place & { location: { lat: number; lng: number } } => !!p.location)
      .map((p) => ({ id: `p-${p.slug}`, lat: p.location.lat, lng: p.location.lng, label: p.name, sublabel: p.isDemo ? "Demo listing" : p.city ?? undefined, group })),
  );
}

function NearbyGroups({ d }: { d: DestinationDetail }) {
  const groups = [
    { title: "🏨 Hotels", items: d.nearbyPlaces.hotels, empty: "No hotels listed yet." },
    { title: "🍽️ Restaurants", items: d.nearbyPlaces.restaurants, empty: "No restaurants listed yet." },
    { title: "🛍️ Shopping & markets", items: d.nearbyPlaces.shopping, empty: "No markets listed yet." },
    { title: "✈️ Transport", items: d.nearbyPlaces.transport, empty: "No airports or stations listed nearby." },
  ];
  const hasDemo = Object.values(d.nearbyPlaces).some((list) => list.some((p) => p.isDemo));
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="mb-3 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">{g.title}</h3>
            {g.items.length ? (
              <div className="space-y-3">
                {g.items.map((p) => (
                  <PlaceCard key={p.slug} p={p} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-sm text-muted">{g.empty}</p>
            )}
          </div>
        ))}
      </div>
      {hasDemo && <p className="mt-4 text-xs text-muted">“Demo listing” places are fictional examples shown until real businesses join Africa Discover.</p>}
      {d.experiences.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">🎭 Cultural experiences</h3>
          <div className="flex flex-wrap gap-2">
            {d.experiences.map((e) => (
              <Link key={e.slug} href={`/experiences/${e.slug}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-primary/40">
                {e.emoji} {e.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Reviews({ d }: { d: DestinationDetail }) {
  const r = d.reviews;
  return (
    <div>
      <SectionHeading title="Reviews" subtitle={r.count ? `${r.count} ${r.count === 1 ? "review" : "reviews"} from travellers` : "No reviews yet. Be the first."} />
      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <div className="space-y-5">
          {r.average !== null && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-[family-name:var(--font-display)] text-5xl text-heading">{r.average.toFixed(1)}</p>
              <Stars value={r.average} size={18} />
              <ul className="mt-4 space-y-1.5" aria-label="Rating breakdown">
                {(["5", "4", "3", "2", "1"] as const).map((k) => {
                  const n = r.breakdown[k] ?? 0;
                  const pct = r.count ? Math.round((n / r.count) * 100) : 0;
                  return (
                    <li key={k} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted">{k}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 text-right text-muted">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <ReviewForm slug={d.slug} alreadyReviewed={r.userHasReviewed} />
        </div>
        <ul className="space-y-4">
          {r.items.map((rv) => (
            <li key={rv.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden>
                  {initials(rv.authorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-heading">
                      {rv.authorName}
                      {rv.authorCountry && <span className="font-normal text-muted"> · {rv.authorCountry}</span>}
                    </p>
                    <Stars value={rv.rating} size={14} />
                  </div>
                  <p className="text-xs text-muted">
                    {rv.visitedOn ? `Visited ${rv.visitedOn}` : formatDate(rv.createdAt)}
                    {rv.isSample && " · Sample review"}
                  </p>
                </div>
              </div>
              {rv.title && <h3 className="mt-3 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">{rv.title}</h3>}
              <p className="mt-1.5 leading-relaxed text-ink/85">{rv.body}</p>
            </li>
          ))}
          {r.items.some((x) => x.isSample) && (
            <li className="text-xs text-muted">Reviews marked “Sample review” are placeholder examples written for this prototype, not real traveller reviews.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
