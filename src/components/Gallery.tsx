"use client";

import { useEffect, useState } from "react";
import type { Image } from "@/lib/types";
import { Photo, PhotoCredit } from "./Photo";
import { ChevronLeft, ChevronRight, CloseIcon, ImagesIcon } from "./icons";

/** Main photo + up to four smaller ones, and a full-screen viewer for all photos. */
export function Gallery({ images, name, emoji }: { images: Image[]; name: string; emoji: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  if (images.length === 0) {
    return <Photo image={null} alt={name} sizes="100vw" className="aspect-[16/9] rounded-2xl sm:aspect-[21/9]" placeholderEmoji={emoji} />;
  }

  const [main, ...rest] = images;
  const side = rest.slice(0, 4);

  return (
    <div className="relative">
      <div className={`grid gap-2 overflow-hidden rounded-2xl ${side.length ? "md:grid-cols-[2fr_1fr]" : ""}`}>
        <button type="button" onClick={() => setOpen(0)} className="relative block" aria-label={`Open photo 1 of ${images.length}`}>
          <Photo image={main} alt={name} sizes="(min-width: 768px) 66vw, 100vw" priority className={side.length ? "aspect-[4/3] sm:aspect-[16/10] md:h-full md:min-h-[26rem]" : "aspect-[4/3] sm:aspect-[21/9]"} credit />
        </button>
        {side.length > 0 && (
          <div className={`hidden gap-2 md:grid ${side.length > 1 ? "grid-cols-2" : ""}`}>
            {side.map((img, i) => (
              <button key={img.url} type="button" onClick={() => setOpen(i + 1)} aria-label={`Open photo ${i + 2} of ${images.length}`}>
                <Photo image={img} alt={name} sizes="17vw" className="aspect-square size-full" />
              </button>
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#23241f] shadow"
        >
          <ImagesIcon size={17} /> View all {images.length} photos
        </button>
      )}

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-[80] flex flex-col bg-black/95 text-white">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-white/80">
              {open + 1} / {images.length}
            </p>
            <button type="button" onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-white/10" aria-label="Close photos">
              <CloseIcon />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[open].url} alt={images[open].alt || name} className="max-h-[78vh] max-w-full rounded-lg object-contain" />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setOpen((open - 1 + images.length) % images.length)} className="absolute left-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Previous photo">
                  <ChevronLeft />
                </button>
                <button type="button" onClick={() => setOpen((open + 1) % images.length)} className="absolute right-3 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Next photo">
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
          {images[open].credit && <PhotoCredit image={images[open]} className="mx-auto mb-4 rounded-md" />}
        </div>
      )}
    </div>
  );
}
