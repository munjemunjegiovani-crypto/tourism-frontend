import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { destinationHref, placeLine, photoUrl } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import { AfricaMap } from "@/components/AfricaMap";
import { Photo } from "@/components/Photo";
import { HeartButton } from "@/components/HeartButton";
import { Reveal } from "@/components/Reveal";
import { DestinationCard, ExperienceCard } from "@/components/cards";
import { API_DOWN, Breadcrumbs, ErrorNotice, SectionHeading } from "@/components/ui";
import { CalendarIcon, ClockIcon, WalletIcon } from "@/components/icons";

type Props = PageProps<"/experiences/[slug]">;

async function load(slug: string) {
  try {
    return { e: await api.experience(slug), down: false };
  } catch {
    return { e: null, down: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { e } = await load(slug);
  if (!e) return { title: "Experience" };
  return {
    title: `${e.name} in Africa`,
    description: `${e.tagline} The best places in Africa for ${e.name.toLowerCase()}, when to go and what it costs.`,
    alternates: { canonical: `/experiences/${e.slug}` },
    openGraph: { images: e.image ? [{ url: photoUrl(e.image.url, 1280), alt: e.image.alt }] : undefined },
  };
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const { e, down } = await load(slug);
  if (down) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="This experience is unavailable" body={API_DOWN} />
      </div>
    );
  }
  if (!e) notFound();

  const cover = e.image ?? e.destinations.find((d) => d.image)?.image ?? null;

  return (
    <article>
      <div className={`${container} pt-6`}>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/experiences", label: "Experiences" },
            { label: e.name },
          ]}
        />
        <header className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-5xl" aria-hidden>
              {e.emoji}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl">{e.name}</h1>
            <p className="mt-3 text-xl text-muted">{e.tagline}</p>
            <p className="mt-5 leading-relaxed text-ink/90">{e.description}</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: <ClockIcon size={18} />, label: "Typical length", value: e.typicalDuration },
                { icon: <WalletIcon size={18} />, label: "Price", value: e.priceFrom },
                { icon: <CalendarIcon size={18} />, label: "Best time", value: e.bestTimeToVisit },
              ]
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="rounded-xl bg-sand p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                      <span className="text-primary" aria-hidden>
                        {f.icon}
                      </span>
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm text-heading">{f.value}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#where" className={btn.primary}>
                See where to go
              </Link>
              <HeartButton kind="experience" slug={e.slug} name={e.name} variant="plain" />
            </div>
          </div>
          <Photo image={cover} alt={e.name} sizes="(min-width: 1024px) 50vw, 100vw" priority credit className="aspect-[4/3] rounded-3xl" placeholderEmoji={e.emoji} />
        </header>

        {e.highlights.length > 0 && (
          <section className="mt-14" aria-labelledby="why">
            <h2 id="why" className="text-2xl sm:text-3xl">
              Why you’ll love it
            </h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {e.highlights.map((h) => (
                <li key={h} className="rounded-2xl border border-line bg-surface p-5">
                  <span className="text-accent" aria-hidden>
                    ✦
                  </span>
                  <p className="mt-2">{h}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Reveal as="section" className="mt-16">
          <div id="where" className="scroll-mt-24">
            <SectionHeading
              title="Where to go"
              subtitle={e.countries.length ? `In ${e.countries.map((c) => c.name).join(", ")}.` : undefined}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {e.destinations.map((d) => (
                <DestinationCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </Reveal>

        {e.destinations.length > 0 && (
          <Reveal as="section" className="mt-16">
            <SectionHeading title="On the map" />
            <AfricaMap
              points={e.destinations.map((d) => ({
                id: d.slug,
                lat: d.location.lat,
                lng: d.location.lng,
                label: d.name,
                sublabel: placeLine(d),
                href: destinationHref(d),
                emoji: d.category.emoji,
                group: "destination" as const,
              }))}
              className="aspect-[4/3] sm:aspect-[16/9]"
              ariaLabel={`Map of places for ${e.name}`}
            />
          </Reveal>
        )}

        {e.related.length > 0 && (
          <Reveal as="section" className="mt-16">
            <SectionHeading title="You may also like" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {e.related.map((r) => (
                <ExperienceCard key={r.slug} e={r} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
