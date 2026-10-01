import type { NearbyBusiness } from "@/lib/api";
import { formatDistance, type Locale } from "@/lib/i18n";

type Marked = NearbyBusiness & { mark: string };

const tickStep = (km: number) => (km <= 2 ? 0.5 : km <= 5 ? 1 : km <= 10 ? 2 : 5);

/**
 * A distance ruler from the attraction (0 km) out to the search radius.
 * Each nearby business sits at its real distance; markers that would overlap stack into lanes.
 * The letter on each marker matches the list underneath.
 */
export function NearbyRuler({
  items,
  radiusMeters,
  locale,
  originLabel,
}: {
  items: Marked[];
  radiusMeters: number;
  locale: Locale;
  originLabel: string;
}) {
  const km = radiusMeters / 1000;
  const step = tickStep(km);
  const ticks = Array.from({ length: Math.floor(km / step) + 1 }, (_, i) => i * step);

  // Assign lanes so markers closer than ~6% of the ruler don't sit on top of each other
  const laneEnds: number[] = [];
  const placed = [...items]
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .map((item) => {
      const pct = Math.min(100, (item.distanceMeters / radiusMeters) * 100);
      let lane = laneEnds.findIndex((end) => pct - end >= 6);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = pct;
      return { item, pct, lane };
    });
  const lanes = Math.max(1, laneEnds.length);

  return (
    <figure className="mt-6">
      <div
        className="relative mx-3"
        style={{ height: `${lanes * 2.25 + 3.5}rem` }}
        role="img"
        aria-label={items
          .map((i) => `${i.mark}: ${i.name}, ${formatDistance(i.distanceMeters, locale)}`)
          .join("; ")}
      >
        {/* markers */}
        {placed.map(({ item, pct, lane }) => (
          <span
            key={item.slug}
            className={`absolute flex size-8 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold ring-2 ring-mist ${
              item.sponsored ? "bg-savanna text-basalt" : "bg-canopy text-mist"
            }`}
            style={{ left: `${pct}%`, bottom: `${3.25 + lane * 2.25}rem` }}
          >
            {item.mark}
          </span>
        ))}

        {/* the ruler */}
        <div className="absolute inset-x-0 bottom-[2.25rem] h-1 rounded-full bg-forest/80" />
        <span
          className="absolute bottom-[1.75rem] left-0 size-5 -translate-x-1/2 rounded-full border-4 border-forest bg-mist"
          aria-hidden
        />
        {ticks.map((tk, i) => (
          <span
            key={tk}
            className={`absolute bottom-0 whitespace-nowrap text-xs text-stone tabular-nums ${
              i === 0 ? "-translate-x-3" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
            }`}
            style={{ left: `${(tk / km) * 100}%` }}
          >
            {tk === 0 ? originLabel : `${tk.toLocaleString(locale)} km`}
          </span>
        ))}
      </div>
    </figure>
  );
}
