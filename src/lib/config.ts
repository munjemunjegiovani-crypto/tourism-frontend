/** Settings shared by server and browser code. */

// The separate backend (tourism-backend). Public so the browser can call public endpoints directly.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

// Public address of this website, used for SEO (canonical URLs, Open Graph, sitemap).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const BRAND = {
  name: "Africa Discover",
  wordmark: "AFRICA DISCOVER",
  tagline: "Explore Africa. Experience the Extraordinary.",
};

export const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/map", label: "Map" },
  { href: "/guide", label: "Travel Guide" },
];

/** Session cookie set by the login server action (httpOnly, never readable by page scripts). */
export const SESSION_COOKIE = "ad_session";

/** Default location for "Explore near you" before the visitor shares theirs. */
export const DEFAULT_LOCATION = { label: "Yaoundé", lat: 3.848, lng: 11.502 };

/** Example itinerary shown in the trip planner ("use server" files can only export functions, so it lives here). */
export const SAMPLE_TRIP = { title: "My Cameroon Adventure", stops: ["yaounde", "mount-cameroon", "limbe", "kribi"] };
