import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, type AttractionSummary, type Region } from "@/lib/api";
import { getDictionary, hasLocale, pick } from "@/lib/i18n";
import { AttractionRow } from "@/components/AttractionRow";
import { SearchForm } from "@/components/SearchForm";
import { ApiDown } from "@/components/ApiDown";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export async function generateMetadata({ params }: PageProps<"/[locale]/attractions">): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(locale) ? { title: getDictionary(locale).attractions.title } : {};
}

export default async function AttractionsPage({ params, searchParams }: PageProps<"/[locale]/attractions">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const t = getDictionary(locale);
  const sp = await searchParams;
  const q = one(sp.q)?.slice(0, 80);
  const region = one(sp.region);

  let regions: Region[] = [];
  let attractions: AttractionSummary[] = [];
  let failed = false;
  try {
    [{ data: regions }, { data: attractions }] = await Promise.all([
      api.regions(),
      api.attractions({ q, region: region && /^[a-z0-9-]+$/.test(region) ? region : undefined }),
    ]);
  } catch {
    failed = true;
  }

  const filterHref = (slug?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (slug) p.set("region", slug);
    const s = p.toString();
    return `/${locale}/attractions${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${
      active ? "border-forest bg-forest text-mist" : "border-forest/25 text-forest hover:bg-leaf/50"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-forest sm:text-5xl">{q ? t.attractions.resultsFor(q) : t.attractions.title}</h1>
      <div className="mt-6">
        <SearchForm locale={locale} t={t} defaultValue={q} tone="light" />
      </div>

      {failed ? (
        <ApiDown message={t.errors.apiDown} />
      ) : (
        <>
          <nav aria-label={t.attractions.filter} className="mt-6 flex flex-wrap gap-2">
            <Link href={filterHref()} className={chip(!region)} aria-current={!region ? "page" : undefined}>
              {t.attractions.allRegions}
            </Link>
            {regions.map((r) => (
              <Link
                key={r.slug}
                href={filterHref(r.slug)}
                className={chip(region === r.slug)}
                aria-current={region === r.slug ? "page" : undefined}
              >
                {pick(locale, r.nameEn, r.nameFr)}
              </Link>
            ))}
          </nav>

          {attractions.length ? (
            <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
              {attractions.map((a) => (
                <AttractionRow key={a.slug} a={a} locale={locale} />
              ))}
            </ul>
          ) : (
            <p className="mt-10 max-w-prose text-lg text-stone">{t.attractions.empty}</p>
          )}
        </>
      )}
    </div>
  );
}
