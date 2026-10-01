import type { Metadata } from "next";
import Link from "next/link";
import { api, sessionToken } from "@/lib/api";
import { SAMPLE_TRIP } from "@/lib/config";
import { destinationHref, formatDistance, haversineKm, placeLine } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import type { DestinationCard, TripSummary } from "@/lib/types";
import { createSampleTrip } from "@/app/actions";
import { AfricaMap } from "@/components/AfricaMap";
import { Photo } from "@/components/Photo";
import { NewTripForm } from "@/components/TripForms";
import { API_DOWN, ErrorNotice } from "@/components/ui";
import { RouteIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "My Trip",
  description: "Plan your African adventure: add destinations, reorder stops, add notes and see your route and trip length.",
  robots: { index: false },
};

export default async function TripsPage({ searchParams }: PageProps<"/trip">) {
  const { error } = await searchParams;
  const token = await sessionToken();
  let trips: TripSummary[] | null = null;
  let sample: DestinationCard[] = [];
  try {
    if (token) trips = await api.trips();
    if (!token || trips?.length === 0) sample = (await api.destinations({ slugs: SAMPLE_TRIP.stops, limit: 10 })).data;
  } catch {
    // handled below
  }
  const ordered = SAMPLE_TRIP.stops.map((s) => sample.find((d) => d.slug === s)).filter((d) => !!d);

  return (
    <div className={`${container} pt-10`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">My Trip</h1>
        <p className="mt-3 text-lg text-muted">Collect destinations, put them in order, and see how long your adventure will take.</p>
      </header>
      {error && (
        <p role="alert" className="mt-6 text-danger">
          We couldn&apos;t create that trip. Please try again.
        </p>
      )}

      {token && !trips ? (
        <div className="mt-10">
          <ErrorNotice title="Your trips are unavailable" body={API_DOWN} />
        </div>
      ) : token && trips && trips.length > 0 ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <ul className="grid gap-5 sm:grid-cols-2">
            {trips.map((t) => (
              <li key={t.id}>
                <Link href={`/trip/${t.id}`} className="group block overflow-hidden rounded-2xl border border-line bg-surface hover:border-primary/40">
                  <Photo image={t.image} alt={t.title} sizes="(min-width: 1024px) 30vw, 100vw" className="aspect-[16/9]" imgClassName="transition-transform duration-500 group-hover:scale-105" placeholderEmoji="🧭" />
                  <div className="p-5">
                    <h2 className="font-[family-name:var(--font-sans)] text-xl font-bold tracking-normal">{t.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {t.stopCount} {t.stopCount === 1 ? "stop" : "stops"} · about {t.days} {t.days === 1 ? "day" : "days"}
                      {t.startDate && ` · from ${new Date(t.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                    {t.stopNames && t.stopNames.length > 0 && <p className="mt-2 line-clamp-1 text-sm text-ink/80">{t.stopNames.join(" → ")}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <NewTripForm />
        </div>
      ) : (
        <SamplePlanner stops={ordered} loggedIn={!!token} />
      )}
    </div>
  );
}

/** "My Cameroon Adventure": an example itinerary for guests and members with no trips yet. */
function SamplePlanner({ stops, loggedIn }: { stops: DestinationCard[]; loggedIn: boolean }) {
  const legs = stops.map((s, i) => (i === 0 ? 0 : haversineKm(stops[i - 1].location, s.location)));
  const total = legs.reduce((a, b) => a + b, 0);
  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]" aria-labelledby="sample">
      <div>
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Example itinerary</p>
        <h2 id="sample" className="mt-1 text-3xl">
          {SAMPLE_TRIP.title}
        </h2>
        <p className="mt-2 text-muted">
          {stops.length} stops · about {Math.round(total).toLocaleString("en")} km by road · 8–10 days
        </p>
        <ol className="mt-6 space-y-3">
          {stops.map((s, i) => (
            <li key={s.slug}>
              {i > 0 && <p className="mb-2 ml-5 border-l-2 border-dashed border-line pl-6 text-xs text-muted">{formatDistance(legs[i])?.replace(" away", "")}</p>}
              <Link href={destinationHref(s)} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 hover:border-primary/40">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-ink">{i + 1}</span>
                <Photo image={s.image} alt={s.name} sizes="96px" className="aspect-square w-16 shrink-0 rounded-xl" placeholderEmoji={s.category.emoji} />
                <span className="min-w-0">
                  <span className="block font-semibold text-heading">{s.name}</span>
                  <span className="block text-sm text-muted">{placeLine(s)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          {loggedIn ? (
            <form action={createSampleTrip}>
              <button type="submit" className={btn.primary}>
                <RouteIcon size={17} /> Start with this itinerary
              </button>
            </form>
          ) : (
            <>
              <Link href="/signup?next=/trip" className={btn.primary}>
                <RouteIcon size={17} /> Create a free account to plan
              </Link>
              <Link href="/login?next=/trip" className={btn.secondary}>
                Log in
              </Link>
            </>
          )}
        </div>
        {loggedIn && (
          <div className="mt-10">
            <NewTripForm />
          </div>
        )}
      </div>
      <AfricaMap
        points={stops.map((s, i) => ({ id: s.slug, lat: s.location.lat, lng: s.location.lng, label: s.name, sublabel: placeLine(s), href: destinationHref(s), group: "destination" as const, badge: String(i + 1) }))}
        route
        fitToPoints
        className="aspect-square lg:sticky lg:top-24"
        ariaLabel={`Route map for ${SAMPLE_TRIP.title}`}
      />
    </section>
  );
}
