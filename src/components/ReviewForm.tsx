"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import { submitReview, type FormState } from "@/app/actions";
import { btn, input, label } from "@/lib/ui";
import { useSessionUser } from "./Providers";
import { StarIcon } from "./icons";

/** Review form for logged-in members; a login prompt for everyone else. */
export function ReviewForm({ slug, alreadyReviewed }: { slug: string; alreadyReviewed: boolean }) {
  const user = useSessionUser();
  const path = usePathname();
  const [state, action, pending] = useActionState<FormState, FormData>(submitReview, undefined);
  const [rating, setRating] = useState(0);

  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="font-semibold text-heading">Been here?</p>
        <p className="mt-1 text-sm text-muted">Log in to share your experience and help other travellers.</p>
        <Link href={`/login?next=${encodeURIComponent(path)}`} className={`${btn.secondary} mt-4`}>
          Log in to write a review
        </Link>
      </div>
    );
  }
  if (alreadyReviewed || state?.ok) {
    return (
      <p role="status" className="rounded-2xl border border-line bg-surface p-5 text-sm">
        {state?.message ?? "Thanks for reviewing this destination."}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <p className="font-semibold text-heading">Write a review</p>
      <input type="hidden" name="slug" value={slug} />
      <fieldset>
        <legend className={label}>Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} required className="peer sr-only" onChange={() => setRating(n)} />
              <StarIcon size={28} filled={n <= rating} className="text-accent peer-focus-visible:rounded peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
              <span className="sr-only">{n} stars</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="r-title" className={label}>
          Title
        </label>
        <input id="r-title" name="title" required minLength={3} maxLength={120} className={input} placeholder="Sum up your visit" />
      </div>
      <div>
        <label htmlFor="r-body" className={label}>
          Your review
        </label>
        <textarea id="r-body" name="body" required minLength={20} maxLength={3000} rows={4} className={input} placeholder="What did you love? Any tips for other travellers?" />
      </div>
      <div>
        <label htmlFor="r-when" className={label}>
          When did you visit? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="r-when" name="visitedOn" maxLength={40} className={input} placeholder="e.g. December 2025" />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={btn.primary}>
        {pending ? "Publishing…" : "Publish review"}
      </button>
    </form>
  );
}
