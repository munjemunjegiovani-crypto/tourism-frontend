/* eslint-disable @next/next/no-img-element --
   Photos come from Wikimedia Commons, which serves resized copies itself (Special:FilePath?width=),
   so a plain <img> with srcset is enough and avoids proxying them through the Next.js image optimizer. */

type PhotoProps = {
  src: string | null;
  alt: string;
  credit?: string | null;
  sourceUrl?: string | null;
  creditLabel: string;
  placeholderLabel: string;
  /** Hint to the browser about how wide the image is drawn, e.g. "(min-width: 768px) 160px, 112px" */
  sizes: string;
  className?: string;
  priority?: boolean;
  showCredit?: boolean;
};

const WIDTHS = [320, 640, 960, 1600];

/** For Commons files, build a srcset so phones download small copies. */
function srcSet(src: string) {
  if (!src.includes("Special:FilePath")) return undefined;
  return WIDTHS.map((w) => `${src.replace(/([?&])width=\d+/, `$1width=${w}`)} ${w}w`).join(", ");
}

export function Photo({
  src,
  alt,
  credit,
  sourceUrl,
  creditLabel,
  placeholderLabel,
  sizes,
  className = "",
  priority = false,
  showCredit = true,
}: PhotoProps) {
  // Callers may position the photo themselves (e.g. absolute behind a hero); otherwise it's relative
  const position = /\b(absolute|fixed)\b/.test(className) ? "" : "relative";

  if (!src) {
    return (
      <div
        className={`${position} flex items-end overflow-hidden bg-brand-soft text-heading/70 ${className}`}
        role="img"
        aria-label={placeholderLabel}
      >
        {/* contour lines, a nod to a topographic map */}
        <svg aria-hidden viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full opacity-40">
          {[20, 38, 56, 74, 92].map((r) => (
            <ellipse key={r} cx="140" cy="40" rx={r * 1.4} ry={r} fill="none" stroke="currentColor" strokeWidth="1" />
          ))}
        </svg>
        <span className="relative p-3 text-xs">{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <figure className={`${position} overflow-hidden bg-brand-soft ${className}`}>
      <img
        src={src}
        srcSet={srcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="size-full object-cover text-transparent"
      />
      {showCredit && credit && (
        <figcaption className="absolute right-0 bottom-0 rounded-tl bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
          {creditLabel}{" "}
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener" className="underline">
              {credit}
            </a>
          ) : (
            credit
          )}
        </figcaption>
      )}
    </figure>
  );
}
