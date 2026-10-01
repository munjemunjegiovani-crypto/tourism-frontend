import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

// Rendered inside the [locale] layout. The locale isn't passed to not-found files,
// so this shows English with a link to each home page.
export default function NotFound() {
  const t = getDictionary("en");
  const fr = getDictionary("fr");
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <h1 className="text-4xl text-heading">{t.errors.notFoundTitle}</h1>
      <p className="mt-3 text-lg">{t.errors.notFoundBody}</p>
      <p className="mt-6 flex gap-4">
        <Link href="/en" className="text-brand underline">
          {t.errors.backHome}
        </Link>
        <Link href="/fr" lang="fr" className="text-brand underline">
          {fr.errors.backHome}
        </Link>
      </p>
    </div>
  );
}
