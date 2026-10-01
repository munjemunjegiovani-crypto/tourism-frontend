import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, bookingHref, mapHref, type Attraction, type Category, type NearbyBusiness } from "@/lib/api";
import { formatDistance, getDictionary, hasLocale, pick } from "@/lib/i18n";
import { NearbyRuler } from "@/components/NearbyRuler";
import { ApiDown } from "@/components/ApiDown";

const RADII_KM = [2, 5, 10, 25];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Returns null when the attraction doesn't exist; throws if the API is unreachable. */
async function load(slug: string, type: string | undefined, radiusKm: number) {
  const res = await api.attraction(slug);
  if (!res) return null;
  const [{ data: nearby }, { data: types }] = await Promise.all([
    api.nearby(slug, { type, radius: radiusKm * 1000 }),
    api.categories("business"),
  ]);
  return { attraction: res.data, nearby, types };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/attractions/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) return {};
  const res = await api.attraction(slug).catch(() => null);
  if (!res) return {};
  return { title: res.data.name, description: pick(locale, res.data.summaryEn, res.data.summaryFr) };
}

export default async function AttractionPage({ params, searchParams }: PageProps<"/[locale]/attractions/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const t = getDictionary(locale);
  const sp = await searchParams;

  const typeParam = one(sp.type);
  const type = typeParam && /^[a-z0-9-]+$/.test(typeParam) ? typeParam : undefined;
  const radiusKm = RADII_KM.includes(Number(one(sp.radius))) ? Number(one(sp.radius)) : 10;

  let loaded: { attraction: Attraction; nearby: NearbyBusiness[]; types: Category[] } | null;
  try {
    loaded = await load(slug, type, radiusKm);
  } catch {
    return <ApiDown message={t.errors.apiDown} />;
  }
  if (!loaded) notFound();

  const { attraction: a, nearby, types } = loaded;
  const marked = nearby.map((b, i) => ({ ...b, mark: String.fromCharCode(65 + (i % 26)) }));
  const href = (next: { type?: string; radius?: number }) => {
    const p = new URLSearchParams();
    const nt = "type" in next ? next.type : type;
    if (nt) p.set("type", nt);
    p.set("radius", String(next.radius ?? radiusKm));
    return `/${locale}/attractions/${slug}?${p}#nearby`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${
      active ? "border-forest bg-forest text-mist" : "border-forest/25 text-forest hover:bg-leaf/50"
    }`;

  return (
    <article>
      <header className="bg-forest text-mist">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
          <p className="text-mist/80">
            <Link href={`/${locale}/attractions?region=${a.region.slug}`} className="hover:underline">
              {pick(locale, a.region.nameEn, a.region.nameFr)}
            </Link>
            {", "}
            {a.city.name}
            {", "}
            {pick(locale, a.category.nameEn, a.category.nameFr).toLowerCase()}
          </p>
          <h1 className="mt-2 text-5xl font-bold sm:text-7xl">{a.name}</h1>
          <p className="mt-5 max-w-2xl text-lg text-mist/90">{pick(locale, a.summaryEn, a.summaryFr)}</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {a.bestSeason && (
            <div>
              <dt className="text-sm text-stone">{t.attraction.bestSeason}</dt>
              <dd className="font-bold">{a.bestSeason}</dd>
            </div>
          )}
          {a.entryFee && (
            <div>
              <dt className="text-sm text-stone">{t.attraction.entryFee}</dt>
              <dd className="font-bold">{a.entryFee}</dd>
            </div>
          )}
          <div className="self-end">
            <a href={mapHref(a.location)} target="_blank" rel="noopener" className="text-canopy underline">
              {t.attraction.openMap}
            </a>
          </div>
        </dl>
        {pick(locale, a.descriptionEn, a.descriptionFr) && (
          <p className="mt-8 max-w-prose text-lg">{pick(locale, a.descriptionEn, a.descriptionFr)}</p>
        )}
      </div>

      <section id="nearby" className="border-t border-forest/10 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-3xl font-bold text-forest sm:text-4xl">{t.attraction.nearbyTitle}</h2>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href={href({ type: undefined })} className={chip(!type)} aria-current={!type ? "page" : undefined}>
              {t.attraction.all}
            </Link>
            {types.map((c) => (
              <Link
                key={c.slug}
                href={href({ type: c.slug })}
                className={chip(type === c.slug)}
                aria-current={type === c.slug ? "page" : undefined}
              >
                {pick(locale, c.nameEn, c.nameFr)}
              </Link>
            ))}
            <span className="ml-2 text-sm text-stone">{t.attraction.within}</span>
            {RADII_KM.map((km) => (
              <Link
                key={km}
                href={href({ radius: km })}
                className={chip(radiusKm === km)}
                aria-current={radiusKm === km ? "page" : undefined}
              >
                {km} {t.attraction.km}
              </Link>
            ))}
          </div>

          {marked.length ? (
            <>
              <NearbyRuler items={marked} radiusMeters={radiusKm * 1000} locale={locale} originLabel={t.attraction.you} />
              <ul className="mt-8 divide-y divide-forest/10">
                {marked.map((b) => {
                  const book = bookingHref(b.bookUrl);
                  return (
                    <li key={b.slug} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
                      <span
                        aria-hidden
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          b.sponsored ? "bg-savanna text-basalt" : "bg-canopy text-mist"
                        }`}
                      >
                        {b.mark}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/${locale}/businesses/${b.slug}`} className="text-lg font-bold text-forest hover:underline">
                          {b.name}
                        </Link>
                        <p className="text-sm text-stone">
                          {pick(locale, b.category.nameEn, b.category.nameFr)}
                          {b.priceRange ? `, ${b.priceRange}` : ""} — {t.attraction.away(formatDistance(b.distanceMeters, locale))}
                          {b.sponsored && (
                            <span className="ml-2 rounded bg-savanna/25 px-1.5 py-0.5 text-xs text-savanna-deep">
                              {t.business.sponsored}
                            </span>
                          )}
                        </p>
                      </div>
                      {book && (
                        <a
                          href={book}
                          target="_blank"
                          rel="sponsored noopener"
                          className="ml-12 basis-full rounded-lg bg-savanna px-4 py-2 text-center text-sm font-bold text-basalt hover:bg-savanna/90 sm:ml-0 sm:basis-auto"
                        >
                          {t.business.book}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-8 text-lg text-stone">{t.attraction.nearbyEmpty(radiusKm)}</p>
          )}
        </div>
      </section>
    </article>
  );
}
