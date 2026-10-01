import Link from "next/link";
import type { AttractionSummary } from "@/lib/api";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { Photo } from "@/components/Photo";

/** One place in a list: a photo, then its name, where it is and what it is. */
export function AttractionRow({ a, locale }: { a: AttractionSummary; locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <li className="py-4">
      <Link href={`/${locale}/attractions/${a.slug}`} className="group flex gap-4 sm:gap-5">
        <Photo
          src={a.coverImageUrl}
          alt={a.name}
          creditLabel={t.photoBy}
          placeholderLabel={t.noPhoto}
          sizes="(min-width: 640px) 176px, 112px"
          className="aspect-[4/3] w-28 shrink-0 rounded-md sm:w-44"
          showCredit={false}
        />
        <div className="min-w-0">
          <h3 className="text-xl text-heading group-hover:underline sm:text-2xl">{a.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {a.city.name}, {pick(locale, a.category.nameEn, a.category.nameFr).toLowerCase()}
          </p>
          <p className="mt-2 max-w-prose">{pick(locale, a.summaryEn, a.summaryFr)}</p>
        </div>
      </Link>
    </li>
  );
}
