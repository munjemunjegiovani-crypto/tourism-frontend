import type { ReactNode } from "react";
import type { Image } from "@/lib/types";
import { api } from "@/lib/api";
import { BRAND } from "@/lib/config";
import { Photo } from "./Photo";
import { LogoMark } from "./Logo";

/** Split screen: form on one side, a destination photo on the other (hidden on phones). */
export function AuthLayout({ title, subtitle, image, children }: { title: string; subtitle: string; image: Image | null; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-4xl">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:my-8 lg:mr-8 lg:block lg:rounded-3xl">
        <Photo image={image} alt={image?.alt ?? "Africa"} sizes="50vw" credit className="absolute inset-0 size-full" placeholderEmoji="🌍" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.14em]">
            <span className="text-white">
              <LogoMark size={30} />
            </span>
            {BRAND.wordmark}
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight">{BRAND.tagline}</p>
        </div>
      </div>
    </div>
  );
}

/** A featured destination photo for the auth screens. */
export async function authImage(): Promise<Image | null> {
  try {
    const { data } = await api.destinations({ featured: true, limit: 6 });
    return data.find((d) => d.image)?.image ?? null;
  } catch {
    return null;
  }
}
