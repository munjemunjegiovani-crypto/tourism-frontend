/* eslint-disable @next/next/no-img-element --
   Photos come from Wikimedia Commons, which resizes them itself (Special:FilePath?width=),
   so a plain <img> with srcset + lazy loading gives responsive images without a proxy.
   When photos move to a CMS or storage bucket, swap this component for next/image. */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Image } from "@/lib/types";

const WIDTHS = [400, 800, 1200, 1600];

function srcSet(url: string) {
  if (!url.includes("Special:FilePath")) return undefined;
  return WIDTHS.map((w) => `${url.replace(/([?&])width=\d+/, `$1width=${w}`)} ${w}w`).join(", ");
}

/** Photo with credit, or a calm placeholder (never a fake picture of a real place). */
export function Photo({
  image,
  alt,
  sizes,
  className = "",
  imgClassName = "",
  priority = false,
  credit = false,
  placeholderEmoji,
}: {
  image: Image | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  credit?: boolean;
  placeholderEmoji?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An image can fail before React hydrates (onError would be missed), so check once on mount
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  // "absolute" from the caller must not be overridden by our default "relative"
  const pos = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? "" : "relative";

  if (!image || failed) {
    return (
      <div className={`${pos} flex items-center justify-center overflow-hidden bg-sand ${className}`} role="img" aria-label={`${alt} (photo coming soon)`}>
        <svg aria-hidden viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full text-brown/25">
          {[18, 34, 50, 66, 82].map((r) => (
            <ellipse key={r} cx="150" cy="30" rx={r * 1.5} ry={r} fill="none" stroke="currentColor" strokeWidth="1" />
          ))}
        </svg>
        {placeholderEmoji && <span className="relative text-4xl opacity-70">{placeholderEmoji}</span>}
      </div>
    );
  }
  return (
    <div className={`${pos} overflow-hidden bg-sand ${className}`}>
      <img
        ref={ref}
        onError={() => setFailed(true)}
        src={image.url}
        srcSet={srcSet(image.url)}
        sizes={sizes}
        alt={image.alt || alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`size-full object-cover text-transparent ${imgClassName}`}
      />
      {credit && image.credit && <PhotoCredit image={image} />}
    </div>
  );
}

export function PhotoCredit({ image, className = "absolute right-0 bottom-0" }: { image: Image; className?: string }) {
  return (
    <p className={`max-w-[80%] truncate rounded-tl-md bg-black/50 px-2 py-0.5 text-[11px] text-white/90 ${className}`}>
      Photo:{" "}
      {image.sourceUrl ? (
        <a href={image.sourceUrl} target="_blank" rel="noopener" className="underline">
          {image.credit}
        </a>
      ) : (
        image.credit
      )}
      {image.license ? ` (${image.license})` : ""}
    </p>
  );
}
