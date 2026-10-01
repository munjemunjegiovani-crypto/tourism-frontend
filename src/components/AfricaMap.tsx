"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import type { LatLng } from "@/lib/types";
import { MinusIcon, PlusSmallIcon, ResetIcon } from "./map-icons";

/**
 * Africa map drawn with SVG from Natural Earth outlines (world-atlas). No API key or tiles needed.
 *
 * Provider-ready: pages only pass `points` and options. To switch to Mapbox or Google Maps later,
 * write another component with the same props (MapViewProps) and swap the import.
 */

export type MapPointView = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  href?: string;
  emoji?: string | null;
  group: "destination" | "hotel" | "restaurant" | "shopping" | "transport" | "you";
  badge?: string; // e.g. "1", "2" for trip stops
};

export type MapViewProps = {
  points: MapPointView[];
  /** Draw a line through the points in order (trip routes). */
  route?: boolean;
  /** Fit the view to these points instead of the whole continent. */
  fitToPoints?: boolean;
  /** ISO numeric code of a country to highlight. */
  highlightCountry?: string;
  className?: string;
  ariaLabel?: string;
};

const W = 1000;
const H = 760;

// ISO 3166 numeric codes of African countries (Natural Earth ids)
const AFRICA = new Set([
  12, 24, 72, 108, 120, 132, 140, 148, 174, 178, 180, 204, 226, 231, 232, 262, 266, 270, 288, 324, 384, 404, 426, 430, 434, 450, 454, 466, 478, 480,
  504, 508, 516, 562, 566, 624, 646, 678, 686, 690, 694, 706, 710, 716, 728, 729, 732, 748, 768, 788, 800, 818, 834, 854, 894,
]);

type CountryFeature = GeoJSON.Feature<Geometry, { name: string }> & { id?: string };
const topo = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const allCountries = (feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>).features as CountryFeature[];
const isAfrica = (f: CountryFeature) => AFRICA.has(Number(f.id)) || f.properties.name === "Somaliland";
const africa = allCountries.filter(isAfrica);

const groupStyle: Record<MapPointView["group"], { fill: string; ring: string }> = {
  destination: { fill: "var(--primary)", ring: "var(--surface)" },
  hotel: { fill: "var(--brown)", ring: "var(--surface)" },
  restaurant: { fill: "var(--accent)", ring: "var(--surface)" },
  shopping: { fill: "#8a6db1", ring: "var(--surface)" },
  transport: { fill: "#5b7a91", ring: "var(--surface)" },
  you: { fill: "#d0492f", ring: "#fff" },
};

export function AfricaMap({ points, route = false, fitToPoints = false, highlightCountry, className = "", ariaLabel = "Map of Africa" }: MapViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { path, project } = useMemo(() => {
    const projection = geoMercator();
    if (fitToPoints && points.length) {
      // Fit to the points, but never zoom closer than ~4° so context stays visible
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      const pad = 2;
      const [minLat, maxLat] = [Math.min(...lats) - pad, Math.max(...lats) + pad];
      const [minLng, maxLng] = [Math.min(...lngs) - pad, Math.max(...lngs) + pad];
      const box: GeoPermissibleObjects = {
        type: "MultiPoint",
        coordinates: [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
      };
      projection.fitExtent(
        [
          [60, 60],
          [W - 60, H - 60],
        ],
        box,
      );
    } else {
      projection.fitExtent(
        [
          [20, 20],
          [W - 20, H - 20],
        ],
        { type: "FeatureCollection", features: africa } as GeoPermissibleObjects,
      );
    }
    return { path: geoPath(projection), project: (p: LatLng) => projection([p.lng, p.lat]) ?? [0, 0] };
  }, [fitToPoints, points]);

  const projected = points.map((p) => ({ ...p, xy: project(p) }));
  const sel = projected.find((p) => p.id === selected);

  const zoom = (factor: number) =>
    setView((v) => {
      const k = Math.min(Math.max(v.k * factor, 1), 8);
      // keep the centre of the view fixed
      const cx = W / 2;
      const cy = H / 2;
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
    });

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-marker]")) return;
    drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svgRef.current) return;
    const scale = W / svgRef.current.getBoundingClientRect().width;
    setView((v) => ({ ...v, x: drag.current!.x + (e.clientX - drag.current!.px) * scale, y: drag.current!.y + (e.clientY - drag.current!.py) * scale }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const markerR = 9 / Math.sqrt(view.k);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-[color-mix(in_oklab,var(--sand)_55%,var(--surface))] ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block size-full touch-none select-none"
        role="img"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={(e) => {
          if (!(e.target as Element).closest("[data-marker]")) setSelected(null);
        }}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* Neighbouring land for context */}
          {allCountries
            .filter((f) => !isAfrica(f))
            .map((f, i) => (
              <path key={`o-${i}`} d={path(f) ?? ""} fill="var(--line)" opacity={0.45} stroke="none" />
            ))}
          {africa.map((f, i) => (
            <path
              key={`a-${i}`}
              d={path(f) ?? ""}
              fill={highlightCountry && String(Number(f.id)) === highlightCountry ? "var(--accent-soft)" : "var(--surface)"}
              stroke="var(--brown)"
              strokeOpacity={0.35}
              strokeWidth={0.8 / view.k}
            >
              <title>{f.properties.name}</title>
            </path>
          ))}

          {route && projected.length > 1 && (
            <polyline
              points={projected.map((p) => p.xy.join(",")).join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={3 / view.k}
              strokeDasharray={`${8 / view.k} ${6 / view.k}`}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {projected.map((p) => {
            const s = groupStyle[p.group];
            const active = p.id === selected;
            return (
              <g
                key={p.id}
                data-marker
                transform={`translate(${p.xy[0]} ${p.xy[1]})`}
                role="button"
                tabIndex={0}
                aria-label={`${p.label}${p.sublabel ? `, ${p.sublabel}` : ""}`}
                className="cursor-pointer focus:outline-none"
                onClick={() => setSelected(active ? null : p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(active ? null : p.id);
                  }
                }}
              >
                <circle r={(active ? 1.5 : 1) * markerR + 2 / view.k} fill={s.ring} />
                <circle r={(active ? 1.5 : 1) * markerR} fill={s.fill} />
                {p.badge && (
                  <text textAnchor="middle" dy="0.35em" fontSize={11 / Math.sqrt(view.k)} fontWeight={700} fill="var(--primary-ink)">
                    {p.badge}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Popup for the selected marker */}
      {sel && (
        <div
          className="pointer-events-auto absolute z-10 w-60 -translate-x-1/2 -translate-y-full rounded-xl border border-line bg-surface p-3 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.4)]"
          style={{
            left: `${((sel.xy[0] * view.k + view.x) / W) * 100}%`,
            top: `calc(${((sel.xy[1] * view.k + view.y) / H) * 100}% - 14px)`,
          }}
        >
          <p className="font-semibold text-heading">
            {sel.emoji && <span aria-hidden>{sel.emoji} </span>}
            {sel.label}
          </p>
          {sel.sublabel && <p className="text-xs text-muted">{sel.sublabel}</p>}
          {sel.href && (
            <Link href={sel.href} className="mt-2 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
              View details
            </Link>
          )}
        </div>
      )}

      <div className="absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <button type="button" onClick={() => zoom(1.6)} className="flex size-10 items-center justify-center hover:bg-sand" aria-label="Zoom in">
          <PlusSmallIcon />
        </button>
        <button type="button" onClick={() => zoom(1 / 1.6)} className="flex size-10 items-center justify-center border-t border-line hover:bg-sand" aria-label="Zoom out">
          <MinusIcon />
        </button>
        <button type="button" onClick={() => setView({ k: 1, x: 0, y: 0 })} className="flex size-10 items-center justify-center border-t border-line hover:bg-sand" aria-label="Reset view">
          <ResetIcon />
        </button>
      </div>
    </div>
  );
}
