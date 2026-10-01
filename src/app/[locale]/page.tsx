import { api, type AttractionSummary, type Region } from "@/lib/api";
import { getDictionary, hasLocale, pick } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { AttractionRow } from "@/components/AttractionRow";
import { SearchForm } from "@/components/SearchForm";
import { ApiDown } from "@/components/ApiDown";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const t = getDictionary(locale);

  let regions: Region[] = [];
  let attractions: AttractionSummary[] = [];
  let failed = false;
  try {
    [{ data: regions }, { data: attractions }] = await Promise.all([api.regions(), api.attractions()]);
  } catch {
    failed = true;
  }

  // Order regions north to south using the average latitude of their places
  const transect = regions
    .map((region) => {
      const places = attractions.filter((a) => a.region.slug === region.slug);
      const lat = places.length ? places.reduce((s, a) => s + a.location.lat, 0) / places.length : null;
      return { region, places, lat };
    })
    .sort((a, b) => (b.lat ?? -90) - (a.lat ?? -90));

  return (
    <>
      <section className="bg-forest text-mist">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
          <h1 className="max-w-4xl text-5xl font-bold sm:text-7xl">{t.home.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-mist/85">{t.home.intro}</p>
          <div className="mt-10">
            <SearchForm locale={locale} t={t} />
          </div>
        </div>
      </section>

      {failed ? (
        <ApiDown message={t.errors.apiDown} />
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold text-forest sm:text-4xl">{t.home.regionsTitle}</h2>
          <p className="mt-2 text-stone">{t.home.regionsIntro}</p>

          <ol className="mt-10 border-l-2 border-canopy/40">
            {transect.map(({ region, places, lat }) => (
              <li key={region.slug} className="relative pb-12 pl-6 last:pb-0 sm:pl-10">
                <span aria-hidden className="absolute top-2 -left-[7px] size-3 rounded-full bg-canopy" />
                <div className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
                  <div>
                    <h3 className="text-2xl font-bold text-forest">{pick(locale, region.nameEn, region.nameFr)}</h3>
                    {lat !== null && (
                      <p className="font-display text-4xl font-light text-canopy/80 tabular-nums">
                        {lat.toFixed(1)}°N
                      </p>
                    )}
                  </div>
                  {places.length ? (
                    <ul>
                      {places.map((a) => (
                        <AttractionRow key={a.slug} a={a} locale={locale} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-stone">{t.home.noAttractions}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
