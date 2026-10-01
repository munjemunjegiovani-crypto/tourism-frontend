/** Types returned by the Africa Discover API (tourism-backend). */

export type LatLng = { lat: number; lng: number };
export type Image = { url: string; alt: string; credit: string | null; sourceUrl: string | null; license?: string | null };
export type Category = { slug: string; name: string; emoji: string; destinationCount?: number };
export type CountryRef = { slug: string; name: string; flag: string };

export type DestinationCard = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  country: CountryRef;
  city: { slug: string; name: string } | null;
  region: string | null;
  category: Category;
  tags: string[];
  rating: number | null;
  reviewCount: number;
  priceRange: string | null;
  difficulty: "easy" | "moderate" | "difficult" | null;
  bestTimeToVisit: string | null;
  recommendedDuration: string | null;
  popularity: number;
  location: LatLng;
  image: Image | null;
  distanceKm: number | null;
};

export type Activity = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  note?: string | null;
  image: Image | null;
  destinationCount?: number;
};

export type Place = {
  slug: string;
  kind: "hotel" | "restaurant" | "shopping" | "transport";
  name: string;
  description?: string | null;
  rating: number | null;
  priceRange: string | null;
  isDemo: boolean;
  sponsored?: boolean;
  city: string | null;
  distanceKm: number | null;
  location?: LatLng;
  bookUrl?: string | null;
};

export type Review = {
  id: number;
  authorName: string;
  authorCountry: string | null;
  rating: number;
  title: string | null;
  body: string;
  visitedOn: string | null;
  isSample: boolean;
  createdAt: string;
  avatarUrl: string | null;
};

export type DestinationDetail = DestinationCard & {
  description: string;
  highlights: string[];
  openingHours: string | null;
  budget: string | null;
  bestMonths: number[] | null;
  countrySafety: string | null;
  images: Image[];
  activities: Activity[];
  experiences: { slug: string; name: string; emoji: string; tagline: string }[];
  nearbyDestinations: DestinationCard[];
  nearbyPlaces: { hotels: Place[]; restaurants: Place[]; shopping: Place[]; transport: Place[] };
  reviews: {
    count: number;
    average: number | null;
    breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
    items: Review[];
    userHasReviewed: boolean;
  };
};

export type CountrySummary = CountryRef & {
  isoCode: string;
  africaRegion: string;
  tagline: string;
  featured: boolean;
  destinationCount: number;
  image: Image | null;
  location: LatLng;
};

export type CountryDetail = CountrySummary & {
  intro: string;
  capital: string | null;
  currency: string | null;
  languages: string[] | null;
  bestTimeToVisit: string | null;
  recommendedDuration: string | null;
  budget: string | null;
  culture: string | null;
  cuisine: { name: string; description: string }[] | null;
  travelTips: string[] | null;
  safety: string | null;
  destinations: DestinationCard[];
  cities: { slug: string; name: string; region: string | null; popular: boolean; destinationCount: number; location: LatLng }[];
  experiences: ExperienceSummary[];
  articles: { slug: string; title: string; emoji: string; summary: string }[];
};

export type ExperienceSummary = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  typicalDuration?: string | null;
  priceFrom?: string | null;
  image: Image | null;
  destinationCount?: number;
};

export type ExperienceDetail = ExperienceSummary & {
  description: string;
  highlights: string[];
  bestTimeToVisit: string | null;
  destinations: DestinationCard[];
  countries: CountryRef[];
  related: ExperienceSummary[];
};

export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "destinations"; slugs: string[] };

export type ArticleSummary = {
  slug: string;
  section: "essentials" | "tips";
  title: string;
  emoji: string | null;
  summary: string;
  readingMinutes: number;
  publishedAt: string;
  image: Image | null;
  country: CountryRef | null;
};

export type ArticleDetail = ArticleSummary & { body: ArticleBlock[]; destinations: DestinationCard[]; related: ArticleSummary[] };

export type MapPoint = {
  layer: "destination" | "hotel" | "restaurant" | "shopping" | "transport";
  slug: string;
  name: string;
  rating: number | null;
  category: string;
  emoji: string | null;
  countrySlug: string;
  country: string;
  location: LatLng;
  isDemo?: boolean;
};

export type SearchResult = {
  data: DestinationCard[];
  total: number;
  places: (Place & { country: string })[];
  thingsToDo: { slug: string; name: string; emoji: string; description: string; destinations: { slug: string; name: string; note: string | null }[] }[];
  interpretation: {
    intent: "browse" | "things-to-do";
    type: { label: string; category?: string; placeKind?: string } | null;
    place: { kind: "country" | "city" | "destination"; slug: string; name: string; countrySlug: string } | null;
    relation: "in" | "near" | null;
    text: string | null;
  };
};

export type Suggestion = { type: "country" | "city" | "destination" | "experience"; slug: string; label: string; sublabel: string; countrySlug: string };

export type User = { id: number; name: string; email: string; avatarUrl: string | null; homeCity: string | null; createdAt?: string };
export type Me = User & { counts: { saved: number; visited: number; trips: number; reviews: number } };

export type TripSummary = {
  id: number;
  title: string;
  startDate: string | null;
  updatedAt: string;
  stopCount: number;
  days: number;
  image: Image | null;
  stopNames: string[] | null;
};

export type TripDetail = {
  id: number;
  title: string;
  startDate: string | null;
  notes: string | null;
  stops: { id: number; position: number; days: number; notes: string | null; legKm: number; destination: DestinationCard }[];
  summary: { stops: number; totalKm: number; stayDays: number; travelDays: number; estimatedDays: number };
};

export type Favorites = {
  destinations: DestinationCard[];
  visited: DestinationCard[];
  experiences: ExperienceSummary[];
  places: Place[];
};
