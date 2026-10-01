"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cardsForKeys } from "@/app/actions";
import type { DestinationCard as Dest, ExperienceSummary } from "@/lib/types";
import { btn } from "@/lib/ui";
import { useFavorites } from "./Providers";
import { DestinationCard, ExperienceCard } from "./cards";
import { CardGridSkeleton, EmptyState } from "./ui";

/** Favourites saved in this browser by a visitor who is not logged in. */
export function GuestFavorites() {
  const { guestKeys, has } = useFavorites();
  type Cards = { destinations: Dest[]; experiences: ExperienceSummary[] };
  const [loaded, setLoaded] = useState<(Cards & { for: string }) | null>(null);
  const keyString = guestKeys.join("|");
  const NONE: Cards = { destinations: [], experiences: [] };
  // Already-loaded cards stay visible while un-hearting (filtered below); only new keys trigger loading
  const cards: Cards | null = !keyString ? NONE : loaded;

  useEffect(() => {
    let live = true;
    if (!keyString) return;
    cardsForKeys(keyString.split("|"))
      .then((c) => live && setLoaded({ ...c, for: keyString }))
      .catch(() => live && setLoaded({ destinations: [], experiences: [], for: keyString }));
    return () => {
      live = false;
    };
  }, [keyString]);

  if (!cards) return <CardGridSkeleton count={4} />;

  // Hide cards the visitor just un-hearted without refetching
  const destinations = cards.destinations.filter((d) => has("destination", d.slug));
  const experiences = cards.experiences.filter((e) => has("experience", e.slug));

  return (
    <div className="space-y-12">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-semibold text-heading">Your favorites are saved in this browser only.</p>
          <p className="text-sm text-muted">Create a free account to keep them on every device. We’ll move them across for you.</p>
        </div>
        <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
          <Link href="/signup?next=/favorites" className={btn.primary}>
            Sign up
          </Link>
          <Link href="/login?next=/favorites" className={btn.secondary}>
            Log in
          </Link>
        </div>
      </div>
      <FavoriteSections destinations={destinations} experiences={experiences} />
    </div>
  );
}

export function FavoriteSections({ destinations, experiences }: { destinations: Dest[]; experiences: ExperienceSummary[] }) {
  if (!destinations.length && !experiences.length) {
    return (
      <EmptyState
        emoji="🤍"
        title="No favorites yet"
        body="Tap the heart on any destination or experience to save it here for later."
        action={
          <Link href="/explore" className={btn.primary}>
            Start exploring
          </Link>
        }
      />
    );
  }
  return (
    <>
      {destinations.length > 0 && (
        <section aria-labelledby="fav-dest">
          <h2 id="fav-dest" className="mb-5 text-2xl">
            Destinations <span className="text-muted">({destinations.length})</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </section>
      )}
      {experiences.length > 0 && (
        <section aria-labelledby="fav-exp">
          <h2 id="fav-exp" className="mb-5 text-2xl">
            Experiences <span className="text-muted">({experiences.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((e) => (
              <ExperienceCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
