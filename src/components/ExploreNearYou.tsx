"use client";

import { useEffect, useState, useRef } from "react";
import { API_URL } from "@/lib/config";
import type { DestinationCard as Dest } from "@/lib/types";
import { DestinationCard } from "./cards";
import { useLocation } from "./Providers";
import { CardGridSkeleton, EmptyState } from "./ui";
import { LocateIcon } from "./icons";
import { btn } from "@/lib/ui";

export type CityOption = { label: string; lat: number; lng: number };

/**
 * "Explore Near You": destinations sorted by distance from the visitor's location or a chosen city.
 * Uses the browser's geolocation when allowed; the page keeps working when it isn't.
 */
export function ExploreNearYou({ cities }: { cities: CityOption[] }) {
  const { location, status, requestGps, setCity } = useLocation();
  const here = `${location.lat},${location.lng}`;
  const [result, setResult] = useState<{ for: string; items: Dest[] | null; error: boolean } | null>(null);
  const current = result?.for === here ? result : null;
  const items = current?.items ?? null;
  const error = current?.error ?? false;

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/v1/destinations/nearby?near=${here}&radius=400&limit=8`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => !cancelled && setResult({ for: here, items: j.data, error: false }))
      .catch(() => !cancelled && setResult({ for: here, items: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [here]);

  const selectValue = cities.find((c) => c.label === location.label) ? location.label : "";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="near-you" className="text-2xl sm:text-3xl">
            Discover amazing places near {location.label}
          </h2>
          <p className="mt-2 text-muted">Sorted by distance. Change the city or share your location.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="near-city" className="sr-only">
            Choose a city
          </label>
          <select
            id="near-city"
            value={selectValue}
            onChange={(e) => {
              const c = cities.find((x) => x.label === e.target.value);
              if (c) setCity(c);
            }}
            className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-heading"
          >
            {!selectValue && <option value="">{location.source === "gps" ? "Your location" : "Choose a city"}</option>}
            {cities.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={requestGps} className={btn.secondary} disabled={status === "locating"}>
            <LocateIcon size={17} />
            {status === "locating" ? "Locating…" : "Use my location"}
          </button>
        </div>
      </div>

      {(status === "denied" || status === "unavailable") && (
        <p role="status" className="mb-5 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          We couldn&apos;t access your location. Search for a city or destination instead.
        </p>
      )}

      {error ? (
        <EmptyState emoji="🧭" title="Nearby places didn't load" body="Check your connection, or choose another city and try again." />
      ) : items === null ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState emoji="🗺️" title="Nothing listed nearby yet" body="We're adding new destinations every week. Try another city." />
      ) : (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {items.slice(0, 8).map((d) => (
            <div key={d.slug} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <DestinationCard d={d} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** "📍 Use my current location" under the hero search. */
export function HeroLocationButton() {
  const { requestGps, status, location } = useLocation();
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current && status === "idle" && location.source === "gps") {
      document.getElementById("near-you")?.scrollIntoView({ behavior: "smooth", block: "start" });
      asked.current = false;
    }
  }, [status, location.source]);
  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => {
          asked.current = true;
          requestGps();
        }}
        className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-black/40"
      >
        <span aria-hidden>📍</span>
        {status === "locating" ? "Finding you…" : "Use my current location"}
      </button>
      {asked && (status === "denied" || status === "unavailable") && (
        <p role="status" className="rounded-lg bg-black/45 px-3 py-2 text-sm text-white">
          We couldn&apos;t access your location. Search for a city or destination instead.
        </p>
      )}
    </div>
  );
}
