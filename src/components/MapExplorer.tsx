"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, MapPoint } from "@/lib/types";
import { useLocation } from "./Providers";
import { AfricaMap, type MapPointView } from "./AfricaMap";
import { haversineKm, formatDistance } from "@/lib/format";
import { chip } from "@/lib/ui";
import { LocateIcon } from "./icons";

const LAYERS = [
  { key: "destination", label: "Destinations", emoji: "📍", color: "var(--primary)" },
  { key: "hotel", label: "Hotels", emoji: "🏨", color: "var(--brown)" },
  { key: "restaurant", label: "Restaurants", emoji: "🍽️", color: "var(--accent)" },
  { key: "shopping", label: "Markets", emoji: "🛍️", color: "#8a6db1" },
  { key: "transport", label: "Transport", emoji: "✈️", color: "#5b7a91" },
] as const;

type LayerKey = (typeof LAYERS)[number]["key"];

/** Full-page map with layer toggles, a category filter and a list of what is shown. */
export function MapExplorer({ points, categories }: { points: MapPoint[]; categories: Category[] }) {
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(["destination"]));
  const [category, setCategory] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const { location, status, requestGps } = useLocation();
  const [showMe, setShowMe] = useState(false);

  const countries = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of points) if (p.layer === "destination") m.set(p.countrySlug, p.country);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [points]);

  const visible = useMemo(
    () =>
      points.filter(
        (p) =>
          layers.has(p.layer) &&
          (!country || p.countrySlug === country) &&
          (p.layer !== "destination" || !category || p.category === category),
      ),
    [points, layers, category, country],
  );

  const views: MapPointView[] = visible.map((p) => ({
    id: `${p.layer}-${p.slug}`,
    lat: p.location.lat,
    lng: p.location.lng,
    label: p.name,
    sublabel: p.layer === "destination" ? p.country : `${p.isDemo ? "Demo listing · " : ""}${p.country}`,
    href: p.layer === "destination" ? `/destinations/${p.countrySlug}/${p.slug}` : undefined,
    emoji: p.emoji,
    group: p.layer,
  }));
  if (showMe) views.push({ id: "you", lat: location.lat, lng: location.lng, label: "You are here", sublabel: location.label, group: "you" });

  const listed = visible
    .filter((p) => p.layer === "destination")
    .map((p) => ({ ...p, km: haversineKm(location, p.location) }))
    .sort((a, b) => (showMe ? a.km - b.km : (b.rating ?? 0) - (a.rating ?? 0)))
    .slice(0, 30);

  const toggle = (k: LayerKey) =>
    setLayers((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <div className="mb-4 space-y-3">
          <fieldset>
            <legend className="sr-only">Map layers</legend>
            <div className="flex flex-wrap gap-2">
              {LAYERS.map((l) => (
                <button key={l.key} type="button" aria-pressed={layers.has(l.key)} onClick={() => toggle(l.key)} className={chip(layers.has(l.key))}>
                  <span className="size-2.5 rounded-full" style={{ background: l.color }} aria-hidden />
                  {l.emoji} {l.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={showMe}
                onClick={() => {
                  if (!showMe && location.source !== "gps") requestGps();
                  setShowMe((s) => !s);
                }}
                className={chip(showMe)}
              >
                <LocateIcon size={15} /> {showMe ? `Near ${location.label}` : "Show me"}
              </button>
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-heading">Category</span>
              <select value={category ?? ""} onChange={(e) => setCategory(e.target.value || null)} className="rounded-full border border-line bg-surface px-3 py-1.5">
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-heading">Country</span>
              <select value={country ?? ""} onChange={(e) => setCountry(e.target.value || null)} className="rounded-full border border-line bg-surface px-3 py-1.5">
                <option value="">All of Africa</option>
                {countries.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {status === "denied" && showMe && (
            <p role="status" className="text-sm text-danger">
              We couldn&apos;t access your location. Search for a city or destination instead.
            </p>
          )}
        </div>
        <AfricaMap
          key={country ?? "all"}
          points={views}
          fitToPoints={!!country}
          className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/12]"
          ariaLabel="Interactive map of destinations and places across Africa"
        />
        <p className="mt-2 text-xs text-muted">
          {visible.length} places shown. Map outlines from Natural Earth. Listings marked “Demo” are fictional examples.
        </p>
      </div>

      <aside aria-label="Places on the map" className="lg:max-h-[46rem] lg:overflow-y-auto">
        <h2 className="mb-3 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">
          {showMe ? `Closest to ${location.label}` : "Top rated on the map"}
        </h2>
        {listed.length === 0 ? (
          <p className="text-sm text-muted">Turn on the Destinations layer to see a list.</p>
        ) : (
          <ul className="space-y-1">
            {listed.map((p) => (
              <li key={p.slug}>
                <Link href={`/destinations/${p.countrySlug}/${p.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sand">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg" aria-hidden>
                    {p.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-heading">{p.name}</span>
                    <span className="block text-xs text-muted">
                      {p.country}
                      {showMe ? ` · ${formatDistance(p.km)}` : p.rating ? ` · ★ ${p.rating.toFixed(1)}` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
