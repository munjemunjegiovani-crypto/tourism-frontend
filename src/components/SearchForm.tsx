import type { Dictionary, Locale } from "@/lib/i18n";

/** Plain GET form: works without JavaScript, which matters on slow mobile connections. */
export function SearchForm({
  locale,
  t,
  defaultValue,
  tone = "dark",
}: {
  locale: Locale;
  t: Dictionary;
  defaultValue?: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <form action={`/${locale}/attractions`} method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor="q" className="sr-only">
        {t.home.searchLabel}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={t.home.searchPlaceholder}
        className={`min-w-0 flex-1 rounded-lg border px-4 py-3 text-base ${
          dark
            ? "border-band-ink/30 bg-black/20 text-band-ink placeholder:text-band-ink/60"
            : "border-line bg-surface text-ink placeholder:text-muted"
        }`}
      />
      <button
        type="submit"
        className="rounded-lg bg-accent px-5 py-3 font-bold text-accent-ink hover:bg-accent/90"
      >
        {t.home.searchButton}
      </button>
    </form>
  );
}
