import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api, sessionToken } from "@/lib/api";
import { initials } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import type { Favorites, TripSummary } from "@/lib/types";
import { AccountButtons, PasswordForm, ProfileForm } from "@/components/ProfileForms";
import { DestinationCard, ExperienceCard } from "@/components/cards";
import { API_DOWN, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = { title: "My profile", robots: { index: false } };

export default async function ProfilePage() {
  if (!(await sessionToken())) redirect("/login?next=/profile");
  const me = await api.me();
  if (!me) redirect("/login?next=/profile");

  let favs: Favorites | null = null;
  let trips: TripSummary[] = [];
  try {
    [favs, trips] = await Promise.all([api.favorites(), api.trips()]);
  } catch {
    // shown below
  }

  const stats = [
    { label: "Saved", value: me.counts.saved, href: "/favorites" },
    { label: "Visited", value: me.counts.visited, href: "#visited" },
    { label: "Trips", value: me.counts.trips, href: "/trip" },
    { label: "Reviews", value: me.counts.reviews },
  ];

  return (
    <div className={`${container} pt-10`}>
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {me.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatarUrl} alt="" className="size-24 rounded-full border-4 border-surface object-cover shadow" />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-full bg-primary font-[family-name:var(--font-display)] text-3xl text-primary-ink shadow" aria-hidden>
            {initials(me.name)}
          </span>
        )}
        <div>
          <h1 className="text-4xl">{me.name}</h1>
          <p className="mt-1 text-muted">
            {me.email}
            {me.homeCity && ` · ${me.homeCity}`}
          </p>
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{s.label}</dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-3xl text-heading">{s.value}</dd>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-surface p-4 hover:border-primary/40">
              {inner}
            </Link>
          ) : (
            <div key={s.label} className="rounded-2xl border border-line bg-surface p-4">
              {inner}
            </div>
          );
        })}
      </dl>

      {!favs ? (
        <div className="mt-10">
          <ErrorNotice title="Some of your data is unavailable" body={API_DOWN} />
        </div>
      ) : (
        <div className="mt-14 space-y-14">
          <Section title="Saved destinations" href="/favorites" empty="Tap the heart on a destination to save it." count={favs.destinations.length}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favs.destinations.slice(0, 4).map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </Section>
          <Section title="Saved experiences" empty="Save experiences like safaris or food tours to find them again." count={favs.experiences.length}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {favs.experiences.slice(0, 4).map((e) => (
                <ExperienceCard key={e.slug} e={e} />
              ))}
            </div>
          </Section>
          <Section title="My travel lists" href="/trip" empty="Plan a trip to start a list of places." count={trips.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => (
                <li key={t.id}>
                  <Link href={`/trip/${t.id}`} className="block rounded-2xl border border-line bg-surface p-4 hover:border-primary/40">
                    <p className="font-semibold text-heading">{t.title}</p>
                    <p className="text-sm text-muted">
                      {t.stopCount} stops · about {t.days} days
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
          <div id="visited" className="scroll-mt-24">
            <Section title="Places I’ve visited" empty="Use “Mark as visited” on a destination page to build your travel history." count={favs.visited.length}>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {favs.visited.map((d) => (
                  <DestinationCard key={d.slug} d={d} />
                ))}
              </div>
            </Section>
          </div>
        </div>
      )}

      <section className="mt-16" aria-labelledby="settings">
        <h2 id="settings" className="text-2xl sm:text-3xl">
          Account settings
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-4 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">Profile</h3>
            <ProfileForm user={me} />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-4 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">Password</h3>
            <PasswordForm />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="mb-4 font-[family-name:var(--font-sans)] text-base font-bold tracking-normal">Session</h3>
            <AccountButtons />
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, href, empty, count, children }: { title: string; href?: string; empty: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="text-2xl">
          {title} <span className="text-muted">({count})</span>
        </h2>
        {href && count > 0 && (
          <Link href={href} className="text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        )}
      </div>
      {count === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-6 text-sm text-muted">
          {empty}{" "}
          <Link href="/explore" className={`${btn.ghost} ml-1 inline-flex px-2 py-0 text-primary`}>
            Explore
          </Link>
        </p>
      ) : (
        children
      )}
    </section>
  );
}
