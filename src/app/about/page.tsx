import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@/lib/ui";

export const metadata: Metadata = {
  title: "About Africa Discover",
  description: "Who we are, how to contact us, partnering with Africa Discover, help, privacy and terms.",
  alternates: { canonical: "/about" },
};

const SECTIONS = [
  {
    id: "about",
    title: "About us",
    body: [
      "Africa Discover helps travellers find the continent’s most remarkable places, from Cameroon’s volcanoes and rainforests to the savannas of East Africa and the deserts of the north.",
      "We started with Cameroon, which is often called “Africa in miniature”, and are adding countries one by one. Every destination page brings together what you need to decide and plan: when to go, how long to stay, what it costs and what’s nearby.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: ["Questions, corrections or ideas? We’d love to hear from you. A contact address will be published here when Africa Discover launches publicly."],
  },
  {
    id: "careers",
    title: "Careers",
    body: ["We’re a small team today. When we open roles in travel content, engineering or partnerships, they’ll be listed here."],
  },
  {
    id: "partner",
    title: "Partner with us",
    body: [
      "Hotels, lodges, restaurants, guides and tour operators can list their business next to the destinations travellers are already exploring.",
      "Listings marked “Demo listing” on the site are fictional examples that show where partner businesses will appear.",
    ],
  },
  {
    id: "help",
    title: "Help center",
    body: [
      "Favorites: tap the heart on any destination. Without an account they’re saved in this browser; with an account they follow you to every device.",
      "Trips: create a free account, then use “Add to trip” on any destination. You can reorder stops, set days and add notes.",
      "Location: “Use my current location” asks your browser for permission. If you say no, choose a city instead; nothing else changes.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    body: [
      "We store your name, email, favorites, trips and reviews so the site can show them to you. Your password is stored only as a secure hash.",
      "Your location stays in your browser and is only sent with a request to find places near you. We don’t sell personal data. You can delete your account and everything in it from your profile at any time.",
    ],
  },
  {
    id: "terms",
    title: "Terms of service",
    body: [
      "Travel information on Africa Discover is a guide, not a guarantee. Prices, opening hours, visa rules and safety conditions change, so always check official sources before you travel.",
      "Reviews must describe your own experience. Photos come from Wikimedia Commons and are credited to their authors under their licences.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className={`${container} pt-10`}>
      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-sm font-semibold text-heading hover:bg-sand">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-12">
          <h1 className="text-4xl sm:text-5xl">About Africa Discover</h1>
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl">{s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <p className="text-sm text-muted">
            Looking for safety advice?{" "}
            <Link href="/guide/safety" className="font-semibold text-primary hover:underline">
              Read our safety guide
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
