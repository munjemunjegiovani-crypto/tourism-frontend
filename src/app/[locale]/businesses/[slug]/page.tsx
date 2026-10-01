import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, bookingHref, mapHref, type Business } from "@/lib/api";
import { getDictionary, hasLocale, pick } from "@/lib/i18n";
import { ApiDown } from "@/components/ApiDown";

export async function generateMetadata({ params }: PageProps<"/[locale]/businesses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const res = await api.business(slug).catch(() => null);
  return res ? { title: res.data.name, description: res.data.description ?? undefined } : {};
}

export default async function BusinessPage({ params }: PageProps<"/[locale]/businesses/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale)) notFound();
  const t = getDictionary(locale);

  let b: Business | null;
  try {
    b = (await api.business(slug))?.data ?? null;
  } catch {
    return <ApiDown message={t.errors.apiDown} />;
  }
  if (!b) notFound();

  const book = bookingHref(b.bookUrl);

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-stone">
        <Link href={`/${locale}/attractions?region=${b.region.slug}`} className="hover:underline">
          {pick(locale, b.region.nameEn, b.region.nameFr)}
        </Link>
        {", "}
        {b.city.name}, {pick(locale, b.category.nameEn, b.category.nameFr).toLowerCase()}
      </p>
      <h1 className="mt-2 text-4xl font-bold text-forest sm:text-6xl">{b.name}</h1>
      <p className="mt-3 flex flex-wrap gap-2 text-sm">
        {b.sponsored && (
          <span className="rounded bg-savanna/25 px-2 py-0.5 text-savanna-deep">{t.business.sponsored}</span>
        )}
        {b.verified && <span className="rounded bg-leaf px-2 py-0.5 text-forest">{t.business.verified}</span>}
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_18rem]">
        <div className="max-w-prose space-y-6">
          {b.description && <p className="text-lg">{b.description}</p>}
          {b.amenities?.length ? (
            <ul className="flex flex-wrap gap-2">
              {b.amenities.map((x) => (
                <li key={x} className="rounded-full border border-forest/20 px-3 py-1 text-sm">
                  {x}
                </li>
              ))}
            </ul>
          ) : null}
          {book ? (
            <a
              href={book}
              target="_blank"
              rel="sponsored noopener"
              className="inline-block rounded-lg bg-savanna px-6 py-3 font-bold text-basalt hover:bg-savanna/90"
            >
              {t.business.book}
            </a>
          ) : (
            <p className="text-stone">{t.business.noBooking}</p>
          )}
        </div>

        <dl className="space-y-4 md:border-l md:border-forest/15 md:pl-6">
          {b.priceRange && (
            <div>
              <dt className="text-sm text-stone">{t.business.price}</dt>
              <dd className="font-bold">{b.priceRange}</dd>
            </div>
          )}
          {b.phone && (
            <div>
              <dt className="text-sm text-stone">{t.business.phone}</dt>
              <dd>
                <a href={`tel:${b.phone}`} className="font-bold text-canopy underline">
                  {b.phone}
                </a>
              </dd>
            </div>
          )}
          {b.email && (
            <div>
              <dt className="text-sm text-stone">{t.business.email}</dt>
              <dd>
                <a href={`mailto:${b.email}`} className="font-bold text-canopy underline">
                  {b.email}
                </a>
              </dd>
            </div>
          )}
          {b.address && (
            <div>
              <dt className="text-sm text-stone">{t.business.address}</dt>
              <dd>{b.address}</dd>
            </div>
          )}
          <div>
            <a href={mapHref(b.location)} target="_blank" rel="noopener" className="text-canopy underline">
              {t.business.openMap}
            </a>
          </div>
        </dl>
      </div>
    </article>
  );
}
