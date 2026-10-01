import type { Metadata, Viewport } from "next";
// Fonts are self-hosted from npm: no request to Google at build or run time
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "@fontsource/cormorant-garamond/600.css"; // classic serif headlines in dark mode
import "./globals.css";
import { api, sessionToken } from "@/lib/api";
import { BRAND, SITE_URL } from "@/lib/config";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { themeInitScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name}: ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
  description:
    "Discover Africa's most beautiful destinations, from Mount Cameroon and Kribi to the Serengeti, Marrakech and Victoria Falls. Find things to do, places to stay nearby, and plan your trip.",
  openGraph: { siteName: BRAND.name, type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1511" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Logged-in visitors get their name and saved favourites; everyone else browses as a guest
  const token = await sessionToken();
  const me = token ? await api.me() : null;
  const favoriteKeys = me ? await api.favoriteKeys().catch(() => []) : [];

  return (
    // suppressHydrationWarning: the theme script sets data-theme before React loads
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers user={me ? { name: me.name, avatarUrl: me.avatarUrl } : null} favoriteKeys={favoriteKeys}>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
