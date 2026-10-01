import Link from "next/link";
import type { AttractionSummary } from "@/lib/api";
import { pick, type Locale } from "@/lib/i18n";

/** One place in a list: name first, then where it is and what it is. */
export function AttractionRow({ a, locale }: { a: AttractionSummary; locale: Locale }) {
  return (
    <li className="border-t border-forest/15 py-4 first:border-t-0">
      <Link href={`/${locale}/attractions/${a.slug}`} className="group block">
        <h3 className="text-xl font-semibold text-forest group-hover:underline sm:text-2xl">{a.name}</h3>
        <p className="mt-1 text-sm text-stone">
          {a.city.name}, {pick(locale, a.category.nameEn, a.category.nameFr).toLowerCase()}
        </p>
        <p className="mt-2 max-w-prose">{pick(locale, a.summaryEn, a.summaryFr)}</p>
      </Link>
    </li>
  );
}
