import { StarIcon } from "./icons";

/** "★ 4.7 (128)" — shows "New" when there are no ratings yet. */
export function Rating({ value, count, size = "sm" }: { value: number | null; count?: number; size?: "sm" | "lg" }) {
  if (value === null || value === undefined) return <span className="text-sm text-muted">No ratings yet</span>;
  return (
    <span className={`inline-flex items-center gap-1 ${size === "lg" ? "text-base" : "text-sm"}`}>
      <StarIcon size={size === "lg" ? 18 : 15} className="text-accent" />
      <span className="font-semibold text-heading tabular-nums">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted tabular-nums">({count})</span>}
      <span className="sr-only">out of 5</span>
    </span>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex text-accent" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={size} filled={i <= Math.round(value)} />
      ))}
    </span>
  );
}
