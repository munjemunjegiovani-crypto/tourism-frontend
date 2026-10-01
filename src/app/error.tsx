"use client";

import Link from "next/link";
import { useEffect } from "react";
import { btn, container } from "@/lib/ui";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${container} flex flex-col items-center py-24 text-center`}>
      <p className="text-6xl" aria-hidden>
        🌧️
      </p>
      <h1 className="mt-4 text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">We hit a problem loading this page. It’s usually temporary, so please try again.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => retry()} className={btn.primary}>
          Try again
        </button>
        <Link href="/" className={btn.secondary}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
