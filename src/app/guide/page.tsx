import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { container } from "@/lib/ui";
import type { ArticleSummary } from "@/lib/types";
import { ArticleCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { API_DOWN, ErrorNotice, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Travel Guide",
  description: "Everything to know before you travel in Africa: visas, money, languages, seasons, transport, SIM cards, safety and local customs.",
  alternates: { canonical: "/guide" },
};

export default async function GuidePage() {
  let articles: ArticleSummary[] | null = null;
  try {
    articles = await api.articles();
  } catch {
    // handled below
  }
  const essentials = articles?.filter((a) => a.section === "essentials") ?? [];
  const tips = articles?.filter((a) => a.section === "tips") ?? [];

  return (
    <div className={`${container} pt-10`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Travel Guide</h1>
        <p className="mt-3 text-lg text-muted">Plan with confidence. Practical advice for travelling in Africa, written to be read on the go.</p>
      </header>
      {!articles ? (
        <div className="mt-10">
          <ErrorNotice title="The travel guide is unavailable" body={API_DOWN} />
        </div>
      ) : (
        <>
          <section className="mt-12" aria-labelledby="before">
            <SectionHeading id="before" title="Before you travel" subtitle="The essentials, topic by topic." />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {essentials.map((a) => (
                <li key={a.slug}>
                  <Link href={`/guide/${a.slug}`} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-sand">
                    <span className="text-3xl" aria-hidden>
                      {a.emoji}
                    </span>
                    <span className="mt-3 font-semibold text-heading">{a.title}</span>
                    <span className="mt-1 text-sm text-muted">{a.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <Reveal as="section" className="mt-16">
            <SectionHeading title="Travel articles" subtitle="Ideas and inspiration for your next trip." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
