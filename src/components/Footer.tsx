import Link from "next/link";
import { BRAND } from "@/lib/config";
import { container } from "@/lib/ui";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, TiktokIcon, XIcon, YoutubeIcon } from "./icons";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/experiences", label: "Experiences" },
      { href: "/map", label: "Map" },
      { href: "/guide", label: "Travel Guide" },
    ],
  },
  {
    title: "Popular Countries",
    links: ["cameroon", "kenya", "tanzania", "south-africa", "morocco", "ghana", "nigeria", "rwanda"].map((slug) => ({
      href: `/countries/${slug}`,
      label: slug === "south-africa" ? "South Africa" : slug[0].toUpperCase() + slug.slice(1),
    })),
  },
  {
    title: "Company",
    links: [
      { href: "/about#about", label: "About Us" },
      { href: "/about#contact", label: "Contact" },
      { href: "/about#careers", label: "Careers" },
      { href: "/about#partner", label: "Partner With Us" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/about#help", label: "Help Center" },
      { href: "/guide/safety", label: "Safety" },
      { href: "/about#privacy", label: "Privacy" },
      { href: "/about#terms", label: "Terms" },
    ],
  },
];

const social = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "X", Icon: XIcon },
  { label: "YouTube", Icon: YoutubeIcon },
  { label: "TikTok", Icon: TiktokIcon },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface pb-20 sm:pb-0">
      <div className={`${container} grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]`}>
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">{BRAND.tagline} Discover destinations, experiences and the places to stay and eat around them.</p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {social.map(({ label, Icon }) => (
              <li key={label}>
                {/* Add your real social profile URLs here */}
                <a href="#" aria-label={`${BRAND.name} on ${label}`} className="flex size-10 items-center justify-center rounded-full border border-line text-heading transition-colors hover:bg-sand">
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="font-[family-name:var(--font-sans)] text-sm font-bold tracking-normal text-heading">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-heading">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className={`${container} flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between`}>
          <p>© 2026 Africa Discover. Explore Africa. Experience the extraordinary.</p>
          <p>Prototype data: reviews and ratings are samples, “Demo” listings are fictional, photos are credited to their authors.</p>
        </div>
      </div>
    </footer>
  );
}
