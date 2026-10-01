import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
// Fonts are self-hosted from npm (no request to Google at build or run time)
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/cormorant-garamond/600.css"; // dark mode's classic serif headlines
import { getDictionary, hasLocale } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeToggle, themeInitScript } from "@/components/ThemeToggle";
import "../globals.css";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: { default: t.siteName, template: `%s | ${t.siteName}` },
    description: t.home.intro,
    alternates: { languages: { en: "/en", fr: "/fr" } },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    // suppressHydrationWarning: the theme script sets data-theme before React loads
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <header className="border-b border-band-rule bg-band text-band-ink">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href={`/${locale}`} className="font-display text-xl font-bold tracking-tight dark:text-2xl dark:tracking-normal">
              {t.siteName}
            </Link>
            <nav className="flex items-center gap-4">
              <Link href={`/${locale}/attractions`} className="text-band-ink/90 hover:text-band-ink hover:underline">
                {t.nav.explore}
              </Link>
              <LocaleSwitch locale={locale} label={t.nav.switchTo} />
              <ThemeToggle labels={{ toDark: t.nav.darkMode, toLight: t.nav.lightMode }} />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line text-sm text-muted">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <p>
              © {new Date().getFullYear()} {t.siteName}. {t.footer.note}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
