import Link from "next/link";
import { btn, container } from "@/lib/ui";
import { SearchBox } from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className={`${container} flex flex-col items-center py-20 text-center sm:py-28`}>
      <p className="font-[family-name:var(--font-display)] text-8xl text-accent sm:text-9xl" aria-hidden>
        404
      </p>
      <h1 className="mt-4 text-3xl sm:text-4xl">This trail doesn’t lead anywhere</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for may have moved, or the link is wrong. Let’s get you back on the path.</p>
      <div className="mt-8 w-full max-w-xl text-left">
        <SearchBox size="md" />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={btn.primary}>
          Back to home
        </Link>
        <Link href="/explore" className={btn.secondary}>
          Explore destinations
        </Link>
      </div>
    </div>
  );
}
