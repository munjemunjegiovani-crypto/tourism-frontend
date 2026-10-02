import type { DestinationCard, LatLng } from "./types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatDistance(km: number | null | undefined) {
  if (km === null || km === undefined) return null;
  if (km < 1) return `${Math.max(Math.round(km * 1000 / 50) * 50, 50)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km).toLocaleString("en")} km away`;
}

/** Straight-line distance in km. */
export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const placeLine = (d: Pick<DestinationCard, "city" | "country" | "region">) =>
  [d.city?.name ?? d.region, d.country.name].filter(Boolean).join(", ");

export const destinationHref = (d: { slug: string; country: { slug: string } }) => `/destinations/${d.country.slug}/${d.slug}`;

export const difficultyLabel = { easy: "Easy", moderate: "Moderate", difficult: "Difficult" } as const;

export const placeKindLabel = { hotel: "Hotel", restaurant: "Restaurant", shopping: "Shopping", transport: "Transport" } as const;
export const placeKindEmoji = { hotel: "🏨", restaurant: "🍽️", shopping: "🛍️", transport: "✈️" } as const;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** ISO 3166 numeric codes (used by the map outlines) for the countries on the platform. */
export const isoNumeric: Record<string, string> = {
  CM: "120", KE: "404", TZ: "834", ZA: "710", MA: "504", EG: "818", RW: "646", GH: "288", NG: "566", NA: "516", SN: "686",
  UG: "800", ET: "231", CI: "384", BW: "72", ZM: "894", ZW: "716", MU: "480", SC: "690", TN: "788", DZ: "12", MG: "450",
  MZ: "508", MW: "454", CD: "180", CG: "178",
};

/**
 * Wikimedia only serves thumbnails in these widths; any other width is refused (HTTP 429).
 * https://www.mediawiki.org/wiki/Common_thumbnail_sizes
 */
export const PHOTO_WIDTHS = [330, 500, 960, 1280, 1920] as const;

/** A Commons photo URL at one of the allowed widths. Other URLs are returned unchanged. */
export function photoUrl(url: string, width: (typeof PHOTO_WIDTHS)[number] = 960) {
  if (!url.includes("Special:FilePath")) return url;
  return /[?&]width=\d+/.test(url) ? url.replace(/([?&])width=\d+/, `$1width=${width}`) : `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
}
