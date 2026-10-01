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
            ? "border-leaf/30 bg-forest/40 text-mist placeholder:text-mist/60"
            : "border-forest/20 bg-white text-basalt placeholder:text-stone"
        }`}
      />
      <button
        type="submit"
        className="rounded-lg bg-savanna px-5 py-3 font-bold text-basalt hover:bg-savanna/90"
      >
        {t.home.searchButton}
      </button>
    </form>
  );
}
