"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { MONTHS } from "@/lib/format";
import { btn } from "@/lib/ui";
import { useLocation } from "./Providers";
import { CloseIcon, FilterIcon } from "./icons";

export type FilterOptions = {
  countries: { slug: string; name: string; flag: string }[];
  categories: { slug: string; name: string; emoji: string }[];
  activities: { slug: string; name: string; emoji: string }[];
};

export type FilterValues = Partial<Record<"q" | "country" | "category" | "minRating" | "price" | "difficulty" | "month" | "activity" | "radius" | "sort", string>>;

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "nearest", label: "Nearest" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
];

/**
 * Filters as a plain GET form: works without JavaScript, and every filter combination has its own URL.
 * Desktop: sidebar. Mobile: a "Filters" button opens it as a drawer.
 */
export function FilterPanel({ options, values, keepQuery = false }: { options: FilterOptions; values: FilterValues; keepQuery?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { location } = useLocation();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const active = Object.entries(values).filter(([k, v]) => v && k !== "sort" && k !== "q").length;

  /** Submit through the router so the page updates without a full reload. */
  const submit = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [k, v] of data.entries()) if (typeof v === "string" && v) params.set(k, v);
    // Distance and "nearest" need a starting point: the visitor's location (or chosen city)
    if (params.get("radius") || params.get("sort") === "nearest") {
      params.set("near", `${location.lat},${location.lng}`);
      params.set("nearLabel", location.label);
    }
    setOpen(false);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const field = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink";

  const body: ReactNode = (
    <form
      key={JSON.stringify(values)} // reset the fields when the URL changes (e.g. after "Clear")
      ref={formRef}
      method="get"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      {keepQuery && <input type="hidden" name="q" value={values.q ?? ""} />}

      <Field label="Country" htmlFor="f-country">
        <select id="f-country" name="country" defaultValue={values.country ?? ""} className={field}>
          <option value="">All countries</option>
          {options.countries.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-heading">Category</legend>
        <div className="flex flex-wrap gap-2">
          <Radio name="category" value="" label="All" checked={!values.category} />
          {options.categories.map((c) => (
            <Radio key={c.slug} name="category" value={c.slug} label={`${c.emoji} ${c.name}`} checked={values.category === c.slug} />
          ))}
        </div>
      </fieldset>

      <Field label={`Distance from ${location.label}`} htmlFor="f-radius">
        <select id="f-radius" name="radius" defaultValue={values.radius ?? ""} className={field}>
          <option value="">Any distance</option>
          <option value="50">Within 50 km</option>
          <option value="200">Within 200 km</option>
          <option value="500">Within 500 km</option>
          <option value="1500">Within 1,500 km</option>
        </select>
      </Field>

      <Field label="Rating" htmlFor="f-rating">
        <select id="f-rating" name="minRating" defaultValue={values.minRating ?? ""} className={field}>
          <option value="">Any rating</option>
          <option value="4.5">4.5 and above</option>
          <option value="4">4.0 and above</option>
          <option value="3.5">3.5 and above</option>
        </select>
      </Field>

      <Field label="Price" htmlFor="f-price">
        <select id="f-price" name="price" defaultValue={values.price ?? ""} className={field}>
          <option value="">Any price</option>
          <option value="Free">Free</option>
          <option value="$">$ Budget</option>
          <option value="$$">$$ Mid-range</option>
          <option value="$$$">$$$ Premium</option>
        </select>
      </Field>

      <Field label="Activity" htmlFor="f-activity">
        <select id="f-activity" name="activity" defaultValue={values.activity ?? ""} className={field}>
          <option value="">Any activity</option>
          {options.activities.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.emoji} {a.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Best time to visit" htmlFor="f-month">
        <select id="f-month" name="month" defaultValue={values.month ?? ""} className={field}>
          <option value="">Any month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              Great in {m}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Difficulty" htmlFor="f-difficulty">
        <select id="f-difficulty" name="difficulty" defaultValue={values.difficulty ?? ""} className={field}>
          <option value="">Any</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="difficult">Difficult</option>
        </select>
      </Field>

      <input type="hidden" name="sort" value={values.sort ?? ""} />

      <div className="flex gap-2 pt-1">
        <button type="submit" className={`${btn.primary} flex-1`}>
          Show results
        </button>
        <button
          type="button"
          className={btn.secondary}
          onClick={() => {
            setOpen(false);
            router.push(keepQuery && values.q ? `${pathname}?q=${encodeURIComponent(values.q)}` : pathname, { scroll: false });
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );

  return (
    <>
      <button type="button" className={`${btn.secondary} lg:hidden`} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="filters-drawer">
        <FilterIcon size={17} /> Filters{active ? ` (${active})` : ""}
      </button>

      {/* Desktop sidebar */}
      <aside aria-label="Filters" className="hidden lg:block">
        {body}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[70] bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            id="filters-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-y-0 right-0 w-[min(24rem,100%)] animate-fade-up overflow-y-auto bg-page p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl">Filters</h2>
              <button type="button" className={btn.icon} onClick={() => setOpen(false)} aria-label="Close filters">
                <CloseIcon />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}

function Radio({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="inline-block rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-heading transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
        {label}
      </span>
    </label>
  );
}

/** Sort dropdown that applies immediately. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { location } = useLocation();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          params.set("sort", e.target.value);
          params.delete("page");
          if (e.target.value === "nearest" && !params.get("near")) {
            params.set("near", `${location.lat},${location.lng}`);
            params.set("nearLabel", location.label);
          }
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="rounded-full border border-line bg-surface px-3 py-2 font-semibold text-heading"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
