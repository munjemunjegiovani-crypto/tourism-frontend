/** Shared class strings so buttons and inputs look the same everywhere. */

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink transition-colors hover:bg-primary-hover disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-primary/40 hover:bg-sand disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-heading transition-colors hover:bg-sand",
  accent:
    "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#1d1608] transition-[filter] hover:brightness-105",
  icon: "inline-flex size-10 items-center justify-center rounded-full text-heading transition-colors hover:bg-sand",
};

export const input =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export const label = "mb-1.5 block text-sm font-semibold text-heading";

export const card = "rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]";

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export const chip = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-heading hover:border-primary/40"
  }`;
