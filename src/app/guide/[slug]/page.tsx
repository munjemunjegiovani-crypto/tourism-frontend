import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate, photoUrl } from "@/lib/format";
import { container } from "@/lib/ui";
import type { ArticleBlock, ArticleDetail } from "@/lib/types";
import { Photo } from "@/components/Photo";
import { ArticleCard, DestinationCard } from "@/components/cards";
import { API_DOWN, Breadcrumbs, ErrorNotice, SectionHeading } from "@/components/ui";

type Props = PageProps<"/guide/[slug]">;

async function load(slug: string) {
  try {
    return { a: await api.article(slug), down: false };
  } catch {
    return { a: null, down: true };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { a } = await load(slug);
  if (!a) return { title: "Travel guide" };
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: `/guide/${a.slug}` },
    openGraph: { type: "article", publishedTime: a.publishedAt, images: a.image ? [{ url: photoUrl(a.image.url, 1280), alt: a.image.alt }] : undefined },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { a, down } = await load(slug);
  if (down) {
    return (
      <div className={`${container} py-16`}>
        <ErrorNotice title="This article is unavailable" body={API_DOWN} />
      </div>
    );
  }
  if (!a) notFound();

  return (
    <article className={`${container} pt-6`}>
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/guide", label: "Travel Guide" },
          { label: a.title },
        ]}
      />
      <header className="mx-auto mt-8 max-w-3xl text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{a.section === "essentials" ? "Before you travel" : "Travel article"}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          {a.emoji && a.section === "essentials" && <span aria-hidden>{a.emoji} </span>}
          {a.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{a.summary}</p>
        <p className="mt-4 text-sm text-muted">
          {a.readingMinutes} min read · Updated {formatDate(a.publishedAt)}
          {a.country && (
            <>
              {" · "}
              <Link href={`/countries/${a.country.slug}`} className="font-semibold text-primary hover:underline">
                {a.country.flag} {a.country.name}
              </Link>
            </>
          )}
        </p>
      </header>
      {a.image && <Photo image={a.image} alt={a.title} sizes="(min-width: 1024px) 64rem, 100vw" priority credit className="mx-auto mt-10 aspect-[21/9] max-w-5xl rounded-3xl" />}

      <div className="mx-auto mt-10 max-w-3xl">
        <Body blocks={a.body} article={a} />
        <p className="mt-10 rounded-xl bg-sand px-4 py-3 text-sm text-muted">
          Rules, prices and conditions change. Check official government and embassy sources before you travel.
        </p>
      </div>

      {a.related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Keep reading" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {a.related.slice(0, 3).map((r) => (
              <ArticleCard key={r.slug} a={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Body({ blocks, article }: { blocks: ArticleBlock[]; article: ArticleDetail }) {
  const bySlug = new Map(article.destinations.map((d) => [d.slug, d]));
  return (
    <div className="space-y-5 text-[1.075rem] leading-relaxed text-ink/90">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-2xl sm:text-3xl">
                {b.text}
              </h2>
            );
          case "p":
            return <p key={i}>{b.text}</p>;
          case "list":
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 text-primary" aria-hidden>
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "destinations": {
            const list = b.slugs.map((s) => bySlug.get(s)).filter((d) => !!d);
            if (!list.length) return null;
            return (
              <div key={i} className="not-prose -mx-2 grid gap-5 py-2 sm:grid-cols-2">
                {list.map((d) => (
                  <DestinationCard key={d.slug} d={d} />
                ))}
              </div>
            );
          }
        }
      })}
    </div>
  );
}
