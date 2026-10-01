"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addToTrip, createTrip, myTrips } from "@/app/actions";
import { haversineKm, formatDistance } from "@/lib/format";
import type { LatLng, TripSummary } from "@/lib/types";
import { btn } from "@/lib/ui";
import { HeartButton } from "./HeartButton";
import { useFavorites, useLocation, useSessionUser } from "./Providers";
import { CheckIcon, PlusIcon, RouteIcon } from "./icons";

/** Save, visited, add-to-trip and share buttons on a destination page. */
export function DestinationActions({ slug, name }: { slug: string; name: string }) {
  const user = useSessionUser();
  const fav = useFavorites();
  const visited = fav.has("destination", slug, "visited");
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <HeartButton kind="destination" slug={slug} name={name} variant="plain" />
      {user ? (
        <button type="button" aria-pressed={visited} onClick={() => fav.toggle("destination", slug, "visited")} className={btn.secondary}>
          {visited ? <CheckIcon size={17} /> : <span aria-hidden>🏁</span>}
          {visited ? "Visited" : "Mark as visited"}
        </button>
      ) : null}
      <AddToTrip slug={slug} />
      <button
        type="button"
        className={btn.secondary}
        onClick={async () => {
          const url = window.location.href;
          if (navigator.share) {
            try {
              await navigator.share({ title: name, url });
              return;
            } catch {
              // cancelled: fall back to copying
            }
          }
          await navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Link copied" : "Share"}
      </button>
    </div>
  );
}

function AddToTrip({ slug }: { slug: string }) {
  const user = useSessionUser();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(path)}`} className={btn.primary}>
        <RouteIcon size={17} /> Add to trip
      </Link>
    );
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        className={btn.primary}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          if (!trips) start(async () => setTrips(await myTrips()));
        }}
      >
        <RouteIcon size={17} /> {done ? "Added to trip" : "Add to trip"}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] sm:left-0 sm:right-auto">
          {pending && !trips ? (
            <p className="p-3 text-sm text-muted">Loading your trips…</p>
          ) : (
            <ul>
              {trips?.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await addToTrip(t.id, slug);
                        setDone(t.title);
                        setOpen(false);
                      })
                    }
                    className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-sand"
                  >
                    <span className="block font-semibold text-heading">{t.title}</span>
                    <span className="block text-xs text-muted">{t.stopCount} stops</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await createTrip("My next adventure", slug);
                      setDone("My next adventure");
                      setOpen(false);
                    })
                  }
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold text-primary hover:bg-sand"
                >
                  <PlusIcon size={17} /> New trip with this place
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
      {done && (
        <p role="status" className="absolute top-full mt-2 text-xs whitespace-nowrap text-muted">
          Added to “{done}”. <Link href="/trip" className="font-semibold text-primary underline">View trip</Link>
        </p>
      )}
    </div>
  );
}

/** "1,240 km from Yaoundé" using the visitor's location or chosen city. */
export function DistanceFromYou({ to }: { to: LatLng }) {
  const { location } = useLocation();
  const km = haversineKm(location, to);
  return (
    <span>
      {formatDistance(km)?.replace(" away", "")} from {location.label}
    </span>
  );
}
