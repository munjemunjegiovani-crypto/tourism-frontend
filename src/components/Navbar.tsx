"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/config";
import { initials } from "@/lib/format";
import { btn, container } from "@/lib/ui";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";
import { useFavorites, useSessionUser } from "./Providers";
import { CloseIcon, CompassIcon, HeartIcon, HomeIcon, MapIcon, MenuIcon, RouteIcon, SearchIcon, UserIcon } from "./icons";

export function Navbar() {
  const pathname = usePathname();
  const user = useSessionUser();
  const fav = useFavorites();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the page changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // Escape closes the search overlay and menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-primary-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          compact ? "border-line bg-page/90 shadow-[0_6px_24px_-16px_rgb(0_0_0/0.35)] backdrop-blur-md" : "border-transparent bg-page"
        }`}
      >
        <div className={`${container} flex items-center gap-4 transition-[height] duration-300 ${compact ? "h-14" : "h-[4.5rem]"}`}>
          <Link href="/" aria-label="Africa Discover home" className="shrink-0">
            <Logo compact={compact} />
          </Link>

          <nav aria-label="Main" className="ml-6 hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive(n.href) ? "bg-sand text-heading" : "text-ink/80 hover:text-heading"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button type="button" className={btn.icon} onClick={() => setSearchOpen(true)} aria-label="Search">
              <SearchIcon />
            </button>
            <Link href="/favorites" className={`${btn.icon} relative max-sm:hidden`} aria-label={`Favorites (${fav.count})`}>
              <HeartIcon />
              {fav.count > 0 && (
                <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-[#1d1608]">
                  {fav.count}
                </span>
              )}
            </Link>
            <ThemeToggle className="max-sm:hidden" />
            {user ? (
              <Link href="/profile" aria-label="Your profile" className="ml-1 hidden sm:block">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-sand text-sm font-bold text-heading">{initials(user.name)}</span>
                )}
              </Link>
            ) : (
              <Link href="/login" className={`${btn.ghost} max-sm:hidden`}>
                Log in
              </Link>
            )}
            <Link href="/explore" className={`${btn.primary} ml-1 max-md:hidden`}>
              Explore Now
            </Link>
            <button
              type="button"
              className={`${btn.icon} lg:hidden`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu */}
        {menuOpen && (
          <div id="mobile-menu" className="border-t border-line bg-page lg:hidden">
            <nav aria-label="Mobile" className={`${container} py-4`}>
              <ul className="grid gap-1">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={isActive(n.href) ? "page" : undefined}
                      className={`block rounded-xl px-4 py-3 text-base font-semibold ${isActive(n.href) ? "bg-sand text-heading" : "text-ink"}`}
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li className="my-2 border-t border-line" />
                <li>
                  <Link href="/favorites" className="block rounded-xl px-4 py-3 font-semibold">
                    Favorites {fav.count > 0 && `(${fav.count})`}
                  </Link>
                </li>
                <li>
                  <Link href="/trip" className="block rounded-xl px-4 py-3 font-semibold">
                    My Trip
                  </Link>
                </li>
                <li>
                  <Link href={user ? "/profile" : "/login"} className="block rounded-xl px-4 py-3 font-semibold">
                    {user ? "Profile" : "Log in / Sign up"}
                  </Link>
                </li>
                <li className="flex items-center justify-between rounded-xl px-4 py-1">
                  <span className="font-semibold">Theme</span>
                  <ThemeToggle />
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto mt-20 w-[min(42rem,calc(100%-2rem))] animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <SearchBox size="lg" autoFocus onNavigate={() => setSearchOpen(false)} />
            <p className="mt-3 text-center text-sm text-white/90">Try “waterfalls near Douala”, “beaches in Cameroon” or “things to do in Nairobi”.</p>
          </div>
        </div>
      )}

      <MobileBottomNav isActive={isActive} pathname={pathname} />
    </>
  );
}

/** Thumb-friendly navigation for phones. */
function MobileBottomNav({ isActive, pathname }: { isActive: (h: string) => boolean; pathname: string }) {
  const items = [
    { href: "/", label: "Home", icon: HomeIcon, active: pathname === "/" },
    { href: "/explore", label: "Explore", icon: CompassIcon, active: isActive("/explore") },
    { href: "/map", label: "Map", icon: MapIcon, active: isActive("/map") },
    { href: "/favorites", label: "Saved", icon: HeartIcon, active: isActive("/favorites") },
    { href: "/trip", label: "Trip", icon: RouteIcon, active: isActive("/trip") },
    { href: "/profile", label: "Me", icon: UserIcon, active: isActive("/profile") || isActive("/login") },
  ];
  return (
    <nav aria-label="Quick" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <ul className="grid grid-cols-6">
        {items.map(({ href, label, icon: Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-primary" : "text-muted"}`}
            >
              <Icon size={21} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
