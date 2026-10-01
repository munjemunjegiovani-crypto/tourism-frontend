import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { api, sessionToken } from "@/lib/api";
import { destinationHref, placeLine } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import type { TripDetail } from "@/lib/types";
import { AfricaMap } from "@/components/AfricaMap";
import { TripEditor, TripSettings } from "@/components/TripForms";
import { API_DOWN, Breadcrumbs, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = { title: "My Trip", robots: { index: false } };

export default async function TripPage({ params }: PageProps<"/trip/[id]">) {
  const { id } = await params;
  if (!(await sessionToken())) redirect(`/login?next=/trip/${id}`);
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) notFound();

  let trip: TripDetail | null = null;
  let down = false;
  try {
    trip = await api.trip(n);
  } catch {
    down = true;
  }
  if (down) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="This trip is unavailable" body={API_DOWN} />
      </div>
    );
  }
  if (!trip) notFound();

  const s = trip.summary;
  return (
    <div className={`${container} pt-6`}>
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/trip", label: "My Trip" },
          { label: trip.title },
        ]}
      />
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">{trip.title}</h1>
          {trip.startDate && (
            <p className="mt-2 text-muted">
              Starts {new Date(trip.startDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          {trip.notes && <p className="mt-3 max-w-2xl text-ink/85">{trip.notes}</p>}
        </div>
        <Link href="/explore" className={btn.secondary}>
          Add more places
        </Link>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Stops", value: s.stops },
          { label: "Distance", value: `${s.totalKm.toLocaleString("en")} km` },
          { label: "Days at stops", value: s.stayDays },
          { label: "Estimated length", value: `${s.estimatedDays} ${s.estimatedDays === 1 ? "day" : "days"}` },
        ].map((x) => (
          <div key={x.label} className="rounded-2xl border border-line bg-surface p-4">
            <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{x.label}</dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl text-heading">{x.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">
        Distances are straight lines between stops. Travel time assumes roads about 30% longer, driven at 50 km/h for 8 hours a day; legs over 900 km count as one flight day.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_26rem]">
        <section aria-label="Stops">
          <TripEditor trip={trip} />
        </section>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {trip.stops.length > 0 && (
            <AfricaMap
              key={trip.stops.map((x) => x.id).join("-")}
              points={trip.stops.map((x, i) => ({
                id: String(x.id),
                lat: x.destination.location.lat,
                lng: x.destination.location.lng,
                label: x.destination.name,
                sublabel: placeLine(x.destination),
                href: destinationHref(x.destination),
                group: "destination" as const,
                badge: String(i + 1),
              }))}
              route
              fitToPoints
              className="aspect-square"
              ariaLabel={`Route map for ${trip.title}`}
            />
          )}
          <TripSettings trip={trip} />
        </aside>
      </div>
    </div>
  );
}
