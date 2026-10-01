import Link from "next/link";
import type { ArticleSummary, CountrySummary, DestinationCard as Dest, ExperienceSummary, Place, Activity } from "@/lib/types";
import { destinationHref, formatDistance, placeLine, placeKindEmoji, placeKindLabel } from "@/lib/format";
import { Photo } from "./Photo";
import { HeartButton } from "./HeartButton";
import { Rating } from "./Rating";
import { ClockIcon, PinIcon } from "./icons";

const hoverZoom = "transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transform-none";

/** Destination card: photo with heart and category badge, then name, place, summary, rating, distance. */
export function DestinationCard({ d, priority = false }: { d: Dest; priority?: boolean }) {
  const href = destinationHref(d);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_20px_40px_-18px_rgb(0_0_0/0.3)]">
      <div className="relative">
        <Photo
          image={d.image}
          alt={d.name}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3]"
          imgClassName={hoverZoom}
          priority={priority}
          placeholderEmoji={d.category.emoji}
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#23241f] shadow-sm backdrop-blur">
          {d.category.emoji} {d.category.name}
        </span>
        <HeartButton kind="destination" slug={d.slug} name={d.name} className="absolute top-2.5 right-2.5 z-10" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg leading-snug">
          {/* The whole card is clickable through this link's overlay */}
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {d.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <PinIcon size={15} />
          {d.country.flag} {placeLine(d)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-ink/85">{d.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
          <Rating value={d.rating} count={d.reviewCount} />
          {d.distanceKm !== null ? (
            <span className="text-muted tabular-nums">{formatDistance(d.distanceKm)}</span>
          ) : d.recommendedDuration ? (
            <span className="inline-flex items-center gap-1 text-muted">
              <ClockIcon size={14} />
              {d.recommendedDuration}
            </span>
          ) : null}
        </div>
        <span className="relative mt-4 inline-flex w-full items-center justify-center rounded-full border border-line py-2 text-sm font-semibold text-heading transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-ink">
          Explore Destination
        </span>
      </div>
    </article>
  );
}

export function CountryCard({ c }: { c: CountrySummary }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-sand shadow-[var(--shadow-card)]">
      <Photo
        image={c.image}
        alt={c.name}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"
        imgClassName={hoverZoom}
        placeholderEmoji={c.flag}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-2xl" aria-hidden>
          {c.flag}
        </p>
        <h3 className="mt-1 text-2xl !text-white">
          <Link href={`/countries/${c.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {c.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{c.tagline}</p>
        <p className="mt-3 text-xs font-semibold text-white/75">
          {c.destinationCount} {c.destinationCount === 1 ? "destination" : "destinations"}
        </p>
      </div>
    </article>
  );
}

export function ExperienceCard({ e, size = "md" }: { e: ExperienceSummary; size?: "md" | "lg" }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-sand shadow-[var(--shadow-card)]">
      <Photo
        image={e.image}
        alt={e.name}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className={size === "lg" ? "aspect-[3/4] sm:aspect-[4/3]" : "aspect-[4/3]"}
        imgClassName={hoverZoom}
        placeholderEmoji={e.emoji}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <HeartButton kind="experience" slug={e.slug} name={e.name} className="absolute top-2.5 right-2.5 z-10" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-xl !text-white">
          <Link href={`/experiences/${e.slug}`} className="after:absolute after:inset-0 after:content-['']">
            <span aria-hidden>{e.emoji}</span> {e.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{e.tagline}</p>
      </div>
    </article>
  );
}

export function ArticleCard({ a }: { a: ArticleSummary }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]">
      <Photo image={a.image} alt={a.title} sizes="(min-width: 1024px) 33vw, 100vw" className="aspect-[16/9]" imgClassName={hoverZoom} placeholderEmoji={a.emoji ?? "📖"} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <Link href={`/guide/${a.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {a.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/85">{a.summary}</p>
        <p className="mt-auto pt-4 text-xs text-muted">{a.readingMinutes} min read</p>
      </div>
    </article>
  );
}

/** Hotels, restaurants, markets and transport near a destination. Real places have no invented rating. */
export function PlaceCard({ p }: { p: Place }) {
  return (
    <article className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-sand text-2xl" aria-hidden>
        {placeKindEmoji[p.kind]}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-[family-name:var(--font-sans)] text-[0.95rem] font-semibold tracking-normal">{p.name}</h4>
        <p className="text-xs text-muted">
          {placeKindLabel[p.kind]}
          {p.priceRange ? ` · ${p.priceRange}` : ""}
          {p.distanceKm !== null ? ` · ${formatDistance(p.distanceKm)}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {p.rating !== null ? <Rating value={p.rating} /> : <span className="text-xs text-muted">Real place, no ratings yet</span>}
          {p.isDemo && <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-ink">Demo listing</span>}
          {p.sponsored && <span className="rounded bg-sand px-1.5 py-0.5 text-[11px] font-semibold text-muted">Sponsored</span>}
        </div>
      </div>
    </article>
  );
}

export function ActivityCard({ a }: { a: Activity }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Photo image={a.image} alt={a.name} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-[16/10]" placeholderEmoji={a.emoji} />
      <div className="p-4">
        <h4 className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">
          <span aria-hidden>{a.emoji}</span> {a.name}
        </h4>
        <p className="mt-1 text-sm text-ink/80">{a.note ?? a.description}</p>
      </div>
    </article>
  );
}
