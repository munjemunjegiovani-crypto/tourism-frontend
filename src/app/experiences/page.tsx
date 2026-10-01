import type { Metadata } from "next";
import { api } from "@/lib/api";
import { container } from "@/lib/ui";
import type { ExperienceSummary } from "@/lib/types";
import { ExperienceCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { API_DOWN, ErrorNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Safaris, hiking, beach holidays, cultural tours, food tours, desert adventures and more across Africa.",
  alternates: { canonical: "/experiences" },
};

export default async function ExperiencesPage() {
  let list: ExperienceSummary[] | null = null;
  try {
    list = await api.experiences();
  } catch {
    // handled below
  }
  return (
    <div className={`${container} pt-10`}>
      <header className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">Experiences</h1>
        <p className="mt-3 text-lg text-muted">Choose how you want to feel Africa, then find the places that do it best.</p>
      </header>
      {!list ? (
        <div className="mt-10">
          <ErrorNotice title="Experiences are unavailable" body={API_DOWN} />
        </div>
      ) : (
        <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => (
            <ExperienceCard key={e.slug} e={e} size={i < 3 ? "lg" : "md"} />
          ))}
        </Reveal>
      )}
    </div>
  );
}
