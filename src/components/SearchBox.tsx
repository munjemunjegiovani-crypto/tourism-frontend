"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import type { Suggestion } from "@/lib/types";
import { SearchIcon } from "./icons";

const typeIcon: Record<Suggestion["type"], string> = { country: "🌍", city: "🏙️", destination: "📍", experience: "✨" };

function hrefFor(s: Suggestion) {
  switch (s.type) {
    case "country":
      return `/countries/${s.slug}`;
    case "destination":
      return `/destinations/${s.countrySlug}/${s.slug}`;
    case "experience":
      return `/experiences/${s.slug}`;
    default:
      return `/search?q=${encodeURIComponent(`things to do in ${s.label}`)}`;
  }
}

/**
 * Search box with live suggestions (accessible combobox).
 * Understands phrases like "waterfalls near Douala"; the search page does the interpreting.
 */
export function SearchBox({
  size = "lg",
  defaultValue = "",
  autoFocus = false,
  placeholder = "Where do you want to explore?",
  onNavigate,
}: {
  size?: "lg" | "md";
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [fetched, setItems] = useState<Suggestion[]>([]);
  const items = value.trim().length < 2 ? [] : fetched;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) return;
    const t = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      try {
        const res = await fetch(`${API_URL}/api/v1/search/suggest?q=${encodeURIComponent(q)}`, { signal: abort.current.signal });
        const json = await res.json();
        setItems(json.data ?? []);
        setActive(-1);
      } catch {
        // offline or aborted: keep the box usable without suggestions
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = () => {
    if (active >= 0 && items[active]) return go(hrefFor(items[active]));
    const q = value.trim();
    if (q) go(`/search?q=${encodeURIComponent(q)}`);
  };

  const big = size === "lg";
  const showList = open && items.length > 0;

  return (
    <div className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={`flex items-center gap-2 rounded-full border border-line bg-surface shadow-[var(--shadow-card)] ${big ? "p-2 pl-5" : "p-1.5 pl-4"}`}
      >
        <SearchIcon className="shrink-0 text-muted" size={big ? 22 : 18} />
        <label htmlFor={`${id}-input`} className="sr-only">
          Search destinations, cities, countries or activities
        </label>
        <input
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted focus:outline-none ${big ? "py-2 text-base sm:text-lg" : "py-1.5 text-[0.95rem]"}`}
        />
        <button type="submit" className={`rounded-full bg-primary font-semibold text-primary-ink transition-colors hover:bg-primary-hover ${big ? "px-6 py-3" : "px-4 py-2 text-sm"}`}>
          Search
        </button>
      </form>

      {showList && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-96 overflow-auto rounded-2xl border border-line bg-surface p-2 text-left shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]"
        >
          {items.map((s, i) => (
            <li
              key={`${s.type}-${s.slug}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(hrefFor(s));
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-sand" : ""}`}
            >
              <span aria-hidden className="text-lg">
                {typeIcon[s.type]}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-heading">{s.label}</span>
                <span className="block truncate text-xs text-muted">{s.sublabel}</span>
              </span>
            </li>
          ))}
          <li
            role="option"
            aria-selected={false}
            onMouseDown={(e) => {
              e.preventDefault();
              go(`/search?q=${encodeURIComponent(value.trim())}`);
            }}
            className="mt-1 cursor-pointer rounded-xl border-t border-line px-3 py-2.5 text-sm text-primary"
          >
            See all results for “{value.trim()}”
          </li>
        </ul>
      )}
    </div>
  );
}
