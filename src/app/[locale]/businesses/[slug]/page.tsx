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
      <p className="text-muted">
        <Link href={`/${locale}/attractions?region=${b.region.slug}`} className="hover:underline">
          {pick(locale, b.region.nameEn, b.region.nameFr)}
        </Link>
        {", "}
        {b.city.name}, {pick(locale, b.category.nameEn, b.category.nameFr).toLowerCase()}
      </p>
      <h1 className="mt-2 text-4xl text-heading sm:text-6xl">{b.name}</h1>
      <p className="mt-3 flex flex-wrap gap-2 text-sm">
        {b.sponsored && (
          <span className="rounded bg-accent/25 px-2 py-0.5 text-accent-deep">{t.business.sponsored}</span>
        )}
        {b.verified && <span className="rounded bg-brand-soft px-2 py-0.5 text-heading">{t.business.verified}</span>}
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_18rem]">
        <div className="max-w-prose space-y-6">
          {b.description && <p className="text-lg">{b.description}</p>}
          {b.amenities?.length ? (
            <ul className="flex flex-wrap gap-2">
              {b.amenities.map((x) => (
                <li key={x} className="rounded-full border border-line px-3 py-1 text-sm">
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
              className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-accent-ink hover:bg-accent/90"
            >
              {t.business.book}
            </a>
          ) : (
            <p className="text-muted">{t.business.noBooking}</p>
          )}
        </div>

        <dl className="space-y-4 md:border-l md:border-line md:pl-6">
          {b.priceRange && (
            <div>
              <dt className="text-sm text-muted">{t.business.price}</dt>
              <dd className="font-bold">{b.priceRange}</dd>
            </div>
          )}
          {b.phone && (
            <div>
              <dt className="text-sm text-muted">{t.business.phone}</dt>
              <dd>
                <a href={`tel:${b.phone}`} className="font-bold text-brand underline">
                  {b.phone}
                </a>
              </dd>
            </div>
          )}
          {b.email && (
            <div>
              <dt className="text-sm text-muted">{t.business.email}</dt>
              <dd>
                <a href={`mailto:${b.email}`} className="font-bold text-brand underline">
                  {b.email}
                </a>
              </dd>
            </div>
          )}
          {b.address && (
            <div>
              <dt className="text-sm text-muted">{t.business.address}</dt>
              <dd>{b.address}</dd>
            </div>
          )}
          <div>
            <a href={mapHref(b.location)} target="_blank" rel="noopener" className="text-brand underline">
              {t.business.openMap}
            </a>
          </div>
        </dl>
      </div>
    </article>
  );
}
