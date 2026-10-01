import type { Metadata } from "next";
import { api, sessionToken } from "@/lib/api";
import { container } from "@/lib/ui";
import type { Favorites } from "@/lib/types";
import { FavoriteSections, GuestFavorites } from "@/components/GuestFavorites";
import { PlaceCard, DestinationCard } from "@/components/cards";
import { API_DOWN, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Destinations and experiences you saved on Africa Discover.",
  robots: { index: false },
};

export default async function FavoritesPage() {
  const token = await sessionToken();
  let favs: Favorites | null = null;
  let failed = false;
  if (token) {
    try {
      favs = await api.favorites();
    } catch {
      failed = true;
    }
  }

  return (
    <div className={`${container} pt-10`}>
      <header className="mb-10 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Favorites</h1>
        <p className="mt-3 text-lg text-muted">The places you’re dreaming about, all in one spot.</p>
      </header>
      {!token ? (
        <GuestFavorites />
      ) : failed || !favs ? (
        <ErrorNotice title="Your favorites are unavailable" body={API_DOWN} />
      ) : (
        <div className="space-y-12">
          <FavoriteSections destinations={favs.destinations} experiences={favs.experiences} />
          {favs.places.length > 0 && (
            <section aria-labelledby="fav-places">
              <h2 id="fav-places" className="mb-5 text-2xl">
                Places <span className="text-muted">({favs.places.length})</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favs.places.map((p) => (
                  <PlaceCard key={p.slug} p={p} />
                ))}
              </div>
            </section>
          )}
          {favs.visited.length > 0 && (
            <section aria-labelledby="fav-visited">
              <h2 id="fav-visited" className="mb-5 text-2xl">
                🏁 Places you’ve visited <span className="text-muted">({favs.visited.length})</span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favs.visited.map((d) => (
                  <DestinationCard key={d.slug} d={d} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
