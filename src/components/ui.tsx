import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  title,
  subtitle,
  action,
  id,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: { href: string; label: string };
  id?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
      <div className="max-w-2xl">
        <h2 id={id} className="text-2xl sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ emoji, title, body, action }: { emoji: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-4 text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorNotice({ title = "Something went wrong", body }: { title?: string; body: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4">
      <p className="font-semibold text-heading">{title}</p>
      <p className="mt-1 text-sm text-ink/85">{body}</p>
    </div>
  );
}

export const API_DOWN =
  "We can't load destinations right now. If you're running the site locally, start the backend (tourism-backend: npm run dev), then reload.";

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="skeleton aspect-[4/3]" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-5 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-4 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="opacity-60">/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
