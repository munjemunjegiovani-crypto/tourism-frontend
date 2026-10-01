import "server-only";
import { cookies } from "next/headers";
import { API_URL, SESSION_COOKIE } from "./config";
import type {
  ArticleDetail,
  ArticleSummary,
  Activity,
  Category,
  CountryDetail,
  CountrySummary,
  DestinationCard,
  DestinationDetail,
  ExperienceDetail,
  ExperienceSummary,
  Favorites,
  MapPoint,
  Me,
  Place,
  SearchResult,
  TripDetail,
  TripSummary,
} from "./types";

/**
 * Service layer: every call to the backend goes through here, so pages never depend on
 * where the data comes from. Swap the base URL or add caching in one place.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined | null | string[]>;

function toUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}/api/v1${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  return url;
}

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

async function request<T>(
  path: string,
  { query, method = "GET", body, auth = false, revalidate = 300 }: { query?: Query; method?: string; body?: unknown; auth?: boolean; revalidate?: number } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await sessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(toUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Public catalogue data is cached for 5 minutes; anything personal is never cached
    ...(auth || method !== "GET" ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.error?.code ?? "ERROR", json?.error?.message ?? `Request failed (${res.status})`);
  return json as T;
}

/** Returns null for 404 so pages can call notFound(). */
async function orNull<T>(p: Promise<T>) {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export type DestinationQuery = {
  country?: string[] | string;
  city?: string;
  category?: string[] | string;
  tag?: string[];
  q?: string;
  minRating?: number;
  price?: string[] | string;
  difficulty?: string[] | string;
  month?: number;
  activity?: string;
  near?: string; // "lat,lng"
  radius?: number;
  slugs?: string[];
  featured?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
};

export const api = {
  // Catalogue
  categories: () => request<{ data: Category[] }>("/categories").then((r) => r.data),
  activities: () => request<{ data: Activity[] }>("/activities").then((r) => r.data),
  countries: (q: { featured?: boolean; region?: string } = {}) =>
    request<{ data: CountrySummary[] }>("/countries", { query: q }).then((r) => r.data),
  country: (slug: string) => orNull(request<{ data: CountryDetail }>(`/countries/${slug}`).then((r) => r.data)),
  destinations: (q: DestinationQuery = {}) =>
    request<{ data: DestinationCard[]; total: number }>("/destinations", { query: q as Query }),
  destination: (slug: string) =>
    orNull(request<{ data: DestinationDetail }>(`/destinations/${slug}`, { auth: true }).then((r) => r.data)),
  experiences: () => request<{ data: ExperienceSummary[] }>("/experiences").then((r) => r.data),
  experience: (slug: string) => orNull(request<{ data: ExperienceDetail }>(`/experiences/${slug}`).then((r) => r.data)),
  articles: (section?: "essentials" | "tips") =>
    request<{ data: ArticleSummary[] }>("/articles", { query: { section } }).then((r) => r.data),
  article: (slug: string) => orNull(request<{ data: ArticleDetail }>(`/articles/${slug}`).then((r) => r.data)),
  map: (q: { layers?: string; category?: string; country?: string } = {}) =>
    request<{ data: MapPoint[] }>("/map", { query: q }).then((r) => r.data),
  places: (q: { kind: string; country?: string; near?: string; radius?: number; limit?: number }) =>
    request<{ data: Place[] }>("/places", { query: q }).then((r) => r.data),
  search: (q: DestinationQuery & { q: string }) => request<SearchResult>("/search", { query: q as Query, revalidate: 60 }),

  // Account (needs the session cookie)
  me: () => orNull(request<{ data: Me }>("/me", { auth: true }).then((r) => r.data)).catch(() => null),
  favorites: () => request<{ data: Favorites }>("/me/favorites", { auth: true }).then((r) => r.data),
  favoriteKeys: () => request<{ data: string[] }>("/me/favorites/keys", { auth: true }).then((r) => r.data),
  trips: () => request<{ data: TripSummary[] }>("/me/trips", { auth: true }).then((r) => r.data),
  trip: (id: number) => orNull(request<{ data: TripDetail }>(`/me/trips/${id}`, { auth: true }).then((r) => r.data)),

  // Raw access for server actions
  send: <T>(path: string, method: string, body?: unknown) => request<T>(path, { method, body, auth: true }),
};

/** Booking links go through the API's /go redirect so clicks are counted. */
export const bookingHref = (bookUrl: string | null | undefined) => (bookUrl ? `${API_URL}${bookUrl}` : null);
