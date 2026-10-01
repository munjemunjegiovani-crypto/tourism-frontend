import { BRAND } from "@/lib/config";

/**
 * Africa Discover logo: a sun rising over a mountain ridge whose peaks echo the "A" of Africa.
 * Drawn in currentColor so it works on light and dark backgrounds; the sun takes the accent colour.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="currentColor" />
      <circle cx="26" cy="15" r="5.5" fill="var(--accent)" />
      <path d="M6 31 15.5 15l5.5 9 3.5-5.5L34 31Z" fill="var(--page)" />
      <path d="M12.2 26h6.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-primary">
      <LogoMark size={compact ? 28 : 34} />
      <span className="font-[family-name:var(--font-sans)] text-[0.95rem] leading-none font-extrabold tracking-[0.14em] text-heading sm:text-base">
        {BRAND.wordmark}
      </span>
    </span>
  );
}
