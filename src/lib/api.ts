import "server-only";

// The backend lives in a separate repo (tourism-backend). Set its URL in .env.local.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type LatLng = { lat: number; lng: number };
export type Named = { slug: string; nameEn: string; nameFr: string };

export type Region = Named;
export type Category = Named & { type?: "attraction" | "business"; icon: string | null };

export type AttractionSummary = {
  id: number;
  slug: string;
  name: string;
  summaryEn: string | null;
  summaryFr: string | null;
  entryFee: string | null;
  coverImageUrl: string | null;
  coverImageCredit: string | null;
  coverImageSourceUrl: string | null;
  location: LatLng;
  city: { slug: string; name: string };
  region: Named;
  country: Named;
  category: Category;
};

export type Attraction = AttractionSummary & {
  descriptionEn: string | null;
  descriptionFr: string | null;
  openingHours: unknown;
  bestSeason: string | null;
};

export type NearbyBusiness = {
  slug: string;
  name: string;
  category: Named;
  distanceMeters: number;
  priceRange: string | null;
  verified: boolean;
  sponsored: boolean;
  coverImageUrl: string | null;
  location: LatLng;
  bookUrl: string | null;
};

export type Business = {
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  amenities: string[] | null;
  priceRange: string | null;
  verified: boolean;
  sponsored: boolean;
  location: LatLng;
  city: { slug: string; name: string };
  region: Named;
  category: Category;
  bookUrl: string | null;
};

type List<T> = { data: T[]; nextCursor?: number | null };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** GET from the API. Listings change rarely, so responses are cached for 5 minutes. */
async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_URL}/api/v1${path}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Same as get(), but returns null on 404 so pages can show notFound(). */
async function getOrNull<T>(path: string, params?: Record<string, string | number | undefined>) {
  try {
    return await get<T>(path, params);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export const api = {
  regions: (country = "cameroon") => get<List<Region>>(`/countries/${country}/regions`),
  categories: (type: "attraction" | "business") => get<List<Category>>("/categories", { type }),
  attractions: (filters: { region?: string; category?: string; q?: string; limit?: number } = {}) =>
    get<List<AttractionSummary>>("/attractions", { limit: 100, ...filters }),
  attraction: (slug: string) => getOrNull<{ data: Attraction }>(`/attractions/${slug}`),
  nearby: (slug: string, opts: { type?: string; radius: number }) =>
    get<List<NearbyBusiness>>(`/attractions/${slug}/nearby`, { ...opts, limit: 30 }),
  business: (slug: string) => getOrNull<{ data: Business }>(`/businesses/${slug}`),
};

/** Booking links go through the API's /go redirect so clicks are counted. */
export const bookingHref = (bookUrl: string | null) => (bookUrl ? `${API_URL}${bookUrl}` : null);

export const mapHref = ({ lat, lng }: LatLng) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;
