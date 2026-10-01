import type { DestinationQuery } from "./api";
import type { FilterValues } from "@/components/FilterPanel";

type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const slug = (v?: string) => (v && /^[a-z0-9-]+$/.test(v) ? v : undefined);

export const PAGE_SIZE = 24;

/** Read Explore/Search filters from the URL, rejecting anything malformed. */
export function readFilters(sp: SP) {
  const values: FilterValues = {
    q: one(sp.q)?.slice(0, 100),
    country: slug(one(sp.country)),
    category: slug(one(sp.category)),
    minRating: one(sp.minRating)?.match(/^\d(\.\d)?$/)?.[0],
    price: ["Free", "$", "$$", "$$$"].includes(one(sp.price) ?? "") ? one(sp.price) : undefined,
    difficulty: ["easy", "moderate", "difficult"].includes(one(sp.difficulty) ?? "") ? one(sp.difficulty) : undefined,
    month: one(sp.month)?.match(/^(1[0-2]|[1-9])$/)?.[0],
    activity: slug(one(sp.activity)),
    radius: one(sp.radius)?.match(/^\d{1,4}$/)?.[0],
    sort: ["recommended", "rating", "nearest", "popular", "newest"].includes(one(sp.sort) ?? "") ? one(sp.sort) : undefined,
  };
  const near = one(sp.near)?.match(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/)?.[0];
  const nearLabel = one(sp.nearLabel)?.slice(0, 60);
  const page = Math.min(Math.max(Number(one(sp.page)) || 1, 1), 20);

  const query: DestinationQuery = {
    country: values.country,
    category: values.category,
    minRating: values.minRating ? Number(values.minRating) : undefined,
    price: values.price,
    difficulty: values.difficulty,
    month: values.month ? Number(values.month) : undefined,
    activity: values.activity,
    near,
    radius: near && values.radius ? Number(values.radius) : undefined,
    sort: values.sort,
    limit: PAGE_SIZE * page,
  };
  return { values, query, near, nearLabel, page };
}

/** Same URL with one parameter changed (for "load more" and removable filter chips). */
export function withParam(sp: SP, key: string, value: string | null) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = one(v);
    if (s) p.set(k, s);
  }
  if (value === null) p.delete(key);
  else p.set(key, value);
  return `?${p.toString()}`;
}
