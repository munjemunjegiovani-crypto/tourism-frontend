import type { SVGProps } from "react";

/** Small line-icon set (24×24, currentColor). Decorative by default: pass aria-label to expose one. */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest["aria-label"] ? undefined : true}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-9.2-9A5.2 5.2 0 0 1 12 5.6 5.2 5.2 0 0 1 21.2 11C19 15.6 12 20 12 20Z" />
  </Svg>
);
export const PinIcon = (p: P) => <Svg {...p}><path d="M12 21s-6.5-6-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></Svg>;
export const StarIcon = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"} strokeWidth={1.4}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z" />
  </Svg>
);
export const MenuIcon = (p: P) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const CloseIcon = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const UserIcon = (p: P) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></Svg>;
export const SunIcon = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg>
);
export const MoonIcon = (p: P) => <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></Svg>;
export const CompassIcon = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></Svg>;
export const MapIcon = (p: P) => <Svg {...p}><path d="m9 4-5 2v14l5-2 6 2 5-2V4l-5 2Z" /><path d="M9 4v14M15 6v14" /></Svg>;
export const CalendarIcon = (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
export const ClockIcon = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
export const WalletIcon = (p: P) => <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M16 12.5h2M3 9h15" /></Svg>;
export const GaugeIcon = (p: P) => <Svg {...p}><path d="M4 16a8 8 0 1 1 16 0" /><path d="m12 16 3.5-4.5" /></Svg>;
export const GlobeIcon = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z" /></Svg>;
export const PlusIcon = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const TrashIcon = (p: P) => <Svg {...p}><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /></Svg>;
export const ArrowUpIcon = (p: P) => <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>;
export const ArrowDownIcon = (p: P) => <Svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Svg>;
export const ChevronRight = (p: P) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const ChevronLeft = (p: P) => <Svg {...p}><path d="m15 5-7 7 7 7" /></Svg>;
export const FilterIcon = (p: P) => <Svg {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Svg>;
export const RouteIcon = (p: P) => <Svg {...p}><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8 18h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" /></Svg>;
export const CheckIcon = (p: P) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
export const LocateIcon = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /><circle cx="12" cy="12" r="7.5" /></Svg>;
export const HomeIcon = (p: P) => <Svg {...p}><path d="m3.5 11 8.5-7 8.5 7" /><path d="M6 9.5V20h12V9.5" /></Svg>;
export const BookIcon = (p: P) => <Svg {...p}><path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3Z" /><path d="M5 17a3 3 0 0 1 3-3h11" /></Svg>;
export const ImagesIcon = (p: P) => <Svg {...p}><rect x="3" y="5" width="15" height="13" rx="2" /><path d="M7 21h12a2 2 0 0 0 2-2V8" /><path d="m3 15 4-4 4 4 2-2 5 5" /></Svg>;

/* Social icons (filled marks) */
const Social = ({ size = 18, d, label }: { size?: number; d: string; label: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={label}>
    <path d={d} />
  </svg>
);
export const InstagramIcon = () => (
  <Social label="Instagram" d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.8.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4-1.4-4.1-4.1C3.7 15 3.6 14.7 3.6 12s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.2-.1Zm0-1.7C9.2 1.9 8.9 2 7.8 2 4.1 2.2 2.2 4.1 2 7.8 2 8.9 1.9 9.2 1.9 12s0 3.1.1 4.2c.2 3.7 2.1 5.6 5.8 5.8 1.1.1 1.4.1 4.2.1s3.1 0 4.2-.1c3.7-.2 5.6-2.1 5.8-5.8.1-1.1.1-1.4.1-4.2s0-3.1-.1-4.2c-.2-3.7-2.1-5.6-5.8-5.8C15.1 2 14.8 1.9 12 1.9Z" />
);
export const FacebookIcon = () => (
  <Social label="Facebook" d="M13.4 21.9v-7.6H16l.4-3h-3V9.4c0-.9.3-1.5 1.5-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6v7.6h3.1Z" />
);
export const XIcon = () => (
  <Social label="X" d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.4L5.4 21H2.3l7.2-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6Z" />
);
export const YoutubeIcon = () => (
  <Social label="YouTube" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" />
);
export const TiktokIcon = () => (
  <Social label="TikTok" d="M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2-2.8V9.3a6.2 6.2 0 1 0 5.3 6.1V8.6a7.8 7.8 0 0 0 4.5 1.4V6.7a4.5 4.5 0 0 1-4.5-4.7Z" />
);
