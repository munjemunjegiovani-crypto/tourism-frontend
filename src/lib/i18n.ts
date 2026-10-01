export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

const en = {
  siteName: "Kamer Trails",
  nav: { explore: "Explore", switchTo: "Français", darkMode: "Switch to dark mode", lightMode: "Switch to light mode" },
  photoBy: "Photo:",
  noPhoto: "Photo coming soon",
  home: {
    title: "Pick a place in Cameroon. See everything near it.",
    intro:
      "Waterfalls, volcanoes, royal palaces and savanna parks, each with the hotels, restaurants and guides around them.",
    searchLabel: "Search places",
    searchPlaceholder: "Try Kribi, waterfall, Mount Cameroon…",
    searchButton: "Search",
    regionsTitle: "From the Sahel to the sea",
    regionsIntro: "Regions are listed north to south, the way the country runs.",
    noAttractions: "No places listed here yet.",
  },
  attractions: {
    title: "All places",
    resultsFor: (q: string) => `Places matching “${q}”`,
    empty: "Nothing matches that search. Try a town or a type of place, like “beach”.",
    allRegions: "All regions",
    filter: "Show",
  },
  attraction: {
    bestSeason: "Best time to go",
    entryFee: "Entry fee",
    openMap: "Open in map",
    nearbyTitle: "Around this place",
    within: "Within",
    all: "All",
    km: "km",
    nearbyEmpty: (km: number) => `Nothing listed within ${km} km yet. Try a wider distance.`,
    away: (d: string) => `${d} away`,
    you: "This place",
  },
  business: {
    book: "Book or visit website",
    sponsored: "Sponsored",
    verified: "Verified",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    address: "Address",
    openMap: "Open in map",
    price: "Price range",
    noBooking: "No booking link yet. Contact the business directly.",
  },
  errors: {
    apiDown: "We can't reach the places service right now. Check that the API is running, then reload.",
    notFoundTitle: "This page isn't here",
    notFoundBody: "The link may be old or mistyped.",
    backHome: "Go to the home page",
  },
  footer: {
    note: "Demo listings are fictional and marked “Demo”. Locations are approximate.",
  },
};

export type Dictionary = typeof en;

const fr: Dictionary = {
  siteName: "Kamer Trails",
  nav: { explore: "Explorer", switchTo: "English", darkMode: "Passer en mode sombre", lightMode: "Passer en mode clair" },
  photoBy: "Photo :",
  noPhoto: "Photo bientôt disponible",
  home: {
    title: "Choisissez un lieu au Cameroun. Voyez tout ce qui l'entoure.",
    intro:
      "Chutes d'eau, volcans, palais royaux et parcs de savane, avec les hôtels, restaurants et guides à proximité.",
    searchLabel: "Rechercher des lieux",
    searchPlaceholder: "Essayez Kribi, chute, mont Cameroun…",
    searchButton: "Rechercher",
    regionsTitle: "Du Sahel à la mer",
    regionsIntro: "Les régions sont listées du nord au sud, comme le pays.",
    noAttractions: "Aucun lieu répertorié ici pour l'instant.",
  },
  attractions: {
    title: "Tous les lieux",
    resultsFor: (q: string) => `Lieux correspondant à « ${q} »`,
    empty: "Aucun résultat. Essayez une ville ou un type de lieu, comme « plage ».",
    allRegions: "Toutes les régions",
    filter: "Afficher",
  },
  attraction: {
    bestSeason: "Meilleure période",
    entryFee: "Droit d'entrée",
    openMap: "Ouvrir la carte",
    nearbyTitle: "Autour de ce lieu",
    within: "Dans un rayon de",
    all: "Tout",
    km: "km",
    nearbyEmpty: (km: number) => `Rien de répertorié dans un rayon de ${km} km. Élargissez la distance.`,
    away: (d: string) => `à ${d}`,
    you: "Ce lieu",
  },
  business: {
    book: "Réserver ou voir le site",
    sponsored: "Sponsorisé",
    verified: "Vérifié",
    contact: "Contact",
    phone: "Téléphone",
    email: "E-mail",
    address: "Adresse",
    openMap: "Ouvrir la carte",
    price: "Gamme de prix",
    noBooking: "Pas encore de lien de réservation. Contactez l'établissement directement.",
  },
  errors: {
    apiDown: "Le service des lieux est injoignable. Vérifiez que l'API tourne, puis rechargez.",
    notFoundTitle: "Cette page n'existe pas",
    notFoundBody: "Le lien est peut-être ancien ou mal saisi.",
    backHome: "Aller à l'accueil",
  },
  footer: {
    note: "Les fiches « Demo » sont fictives. Les positions sont approximatives.",
  },
};

export const getDictionary = (locale: Locale): Dictionary => (locale === "fr" ? fr : en);

/** Pick the French or English field of a bilingual record. */
export const pick = (locale: Locale, en?: string | null, fr?: string | null) =>
  (locale === "fr" ? fr || en : en || fr) ?? "";

export const formatDistance = (meters: number, locale: Locale) =>
  meters < 1000
    ? `${Math.round(meters / 10) * 10} m`
    : `${(meters / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} km`;
