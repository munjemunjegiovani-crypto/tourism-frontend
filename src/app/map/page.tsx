import type { Metadata } from "next";
import { api } from "@/lib/api";
import { container } from "@/lib/ui";
import type { Category, MapPoint } from "@/lib/types";
import { MapExplorer } from "@/components/MapExplorer";
import { API_DOWN, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Map of Africa",
  description: "An interactive map of destinations, hotels, restaurants, markets and airports across Africa.",
  alternates: { canonical: "/map" },
};

export default async function MapPage() {
  let data: { points: MapPoint[]; categories: Category[] } | null = null;
  try {
    const [points, categories] = await Promise.all([api.map({ layers: "destinations,hotel,restaurant,shopping,transport" }), api.categories()]);
    data = { points, categories };
  } catch {
    // handled below
  }
  return (
    <div className={`${container} pt-10`}>
      <header className="mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Map</h1>
        <p className="mt-3 text-lg text-muted">
          See where everything is. Turn on hotels, restaurants, markets and transport, or show what’s closest to you.
        </p>
      </header>
      {data ? <MapExplorer points={data.points} categories={data.categories} /> : <ErrorNotice title="The map is unavailable" body={API_DOWN} />}
    </div>
  );
}
