"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { setFavorite } from "@/app/actions";
import { DEFAULT_LOCATION } from "@/lib/config";

/* ---------- Session ---------- */

type SessionUser = { name: string; avatarUrl: string | null } | null;
const SessionContext = createContext<SessionUser>(null);
export const useSessionUser = () => useContext(SessionContext);

/* ---------- Favourites ---------- */

type FavKind = "destination" | "experience" | "place";
type FavoritesApi = {
  has: (kind: FavKind, slug: string, list?: "saved" | "visited") => boolean;
  toggle: (kind: FavKind, slug: string, list?: "saved" | "visited") => void;
  count: number;
  guestKeys: string[];
  loggedIn: boolean;
};
const FavoritesContext = createContext<FavoritesApi | null>(null);
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <Providers>");
  return ctx;
}

const GUEST_KEY = "ad:favorites";
const readGuest = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
  } catch {
    return [];
  }
};

/* ---------- Location ---------- */

export type UserLocation = { label: string; lat: number; lng: number; source: "gps" | "city" | "default" };
type LocationApi = {
  location: UserLocation;
  status: "idle" | "locating" | "denied" | "unavailable";
  requestGps: () => void;
  setCity: (loc: { label: string; lat: number; lng: number }) => void;
};
const LocationContext = createContext<LocationApi | null>(null);
export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside <Providers>");
  return ctx;
}
const LOCATION_KEY = "ad:location";

/* ---------- Provider ---------- */

export function Providers({
  user,
  favoriteKeys,
  children,
}: {
  user: SessionUser;
  favoriteKeys: string[];
  children: ReactNode;
}) {
  const loggedIn = Boolean(user);
  const [keys, setKeys] = useState<Set<string>>(() => new Set(favoriteKeys));
  const [guestKeys, setGuestKeys] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  // Keep server state in sync after navigations that refetch the layout
  const [serverKeys, setServerKeys] = useState(favoriteKeys);
  if (serverKeys !== favoriteKeys) {
    setServerKeys(favoriteKeys);
    setKeys(new Set(favoriteKeys));
  }
  useEffect(() => {
    if (!loggedIn) {
      const g = readGuest();
      // Browser storage only exists after hydration, so it is read here
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGuestKeys(g);
      setKeys(new Set(g));
    }
  }, [loggedIn]);

  const keyOf = (kind: FavKind, slug: string, list: "saved" | "visited") => (list === "visited" ? `visited:${kind}:${slug}` : `${kind}:${slug}`);

  const toggle = useCallback(
    (kind: FavKind, slug: string, list: "saved" | "visited" = "saved") => {
      const key = keyOf(kind, slug, list);
      const on = !keys.has(key);
      const next = new Set(keys);
      if (on) next.add(key);
      else next.delete(key);
      setKeys(next); // optimistic

      if (loggedIn) {
        startTransition(async () => {
          try {
            await setFavorite(kind, slug, on, list);
          } catch {
            setKeys(keys); // roll back if the server refused
          }
        });
      } else {
        const saved = [...next].filter((k) => !k.startsWith("visited:"));
        try {
          localStorage.setItem(GUEST_KEY, JSON.stringify(saved));
        } catch {
          // storage unavailable (private mode): favourites last until the tab closes
        }
        setGuestKeys(saved);
      }
    },
    [keys, loggedIn],
  );

  const favorites = useMemo<FavoritesApi>(
    () => ({
      has: (kind, slug, list = "saved") => keys.has(keyOf(kind, slug, list)),
      toggle,
      count: [...keys].filter((k) => !k.startsWith("visited:")).length,
      guestKeys,
      loggedIn,
    }),
    [keys, toggle, guestKeys, loggedIn],
  );

  /* Location: saved choice, else the default city. Never blocks the page. */
  const [location, setLocation] = useState<UserLocation>({ ...DEFAULT_LOCATION, source: "default" });
  const [status, setStatus] = useState<LocationApi["status"]>("idle");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCATION_KEY);
      // Browser storage only exists after hydration, so it is read here
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setLocation(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);
  const remember = (loc: UserLocation) => {
    setLocation(loc);
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // ignore
    }
  };
  const locationApi = useMemo<LocationApi>(
    () => ({
      location,
      status,
      setCity: (loc) => {
        setStatus("idle");
        remember({ ...loc, source: "city" });
      },
      requestGps: () => {
        if (!("geolocation" in navigator)) {
          setStatus("unavailable");
          return;
        }
        setStatus("locating");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setStatus("idle");
            remember({
              label: "your location",
              lat: Math.round(pos.coords.latitude * 1000) / 1000,
              lng: Math.round(pos.coords.longitude * 1000) / 1000,
              source: "gps",
            });
          },
          () => setStatus("denied"),
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
        );
      },
    }),
    [location, status],
  );

  return (
    <SessionContext.Provider value={user}>
      <FavoritesContext.Provider value={favorites}>
        <LocationContext.Provider value={locationApi}>{children}</LocationContext.Provider>
      </FavoritesContext.Provider>
    </SessionContext.Provider>
  );
}
