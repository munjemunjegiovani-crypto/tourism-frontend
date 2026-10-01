"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

/** Links to the same page in the other language. */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const other: Locale = locale === "en" ? "fr" : "en";
  const href = pathname.replace(/^\/(en|fr)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      className="rounded-full border border-band-ink/40 px-3 py-1 text-sm text-band-ink hover:bg-band-ink/10"
    >
      {label}
    </Link>
  );
}
