"use client";

import { useState } from "react";
import { useFavorites } from "./Providers";
import { HeartIcon } from "./icons";

/** Heart that saves a destination, experience or place. Works for guests (browser) and members (account). */
export function HeartButton({
  kind,
  slug,
  name,
  className = "",
  variant = "overlay",
}: {
  kind: "destination" | "experience" | "place";
  slug: string;
  name: string;
  className?: string;
  variant?: "overlay" | "plain";
}) {
  const fav = useFavorites();
  const on = fav.has(kind, slug);
  const [popping, setPopping] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fav.toggle(kind, slug);
        setPopping(true);
      }}
      onAnimationEnd={() => setPopping(false)}
      className={`inline-flex size-10 items-center justify-center rounded-full transition-colors ${
        variant === "overlay"
          ? "bg-white/90 text-[#23241f] shadow-sm backdrop-blur hover:bg-white"
          : "border border-line bg-surface text-heading hover:bg-sand"
      } ${className}`}
    >
      <HeartIcon size={19} filled={on} className={`${on ? "text-[#d0492f]" : ""} ${popping ? "animate-pop" : ""}`} />
    </button>
  );
}
