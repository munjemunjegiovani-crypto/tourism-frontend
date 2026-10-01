"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, signup, type FormState } from "@/app/actions";
import { btn, input, label } from "@/lib/ui";
import { useFavorites } from "./Providers";

/** Log in / sign up. Favorites saved as a guest are sent along and moved into the account. */
export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, undefined);
  const { guestKeys } = useFavorites();
  const [show, setShow] = useState(false);
  const other = mode === "login" ? "/signup" : "/login";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="guestFavorites" value={JSON.stringify(guestKeys)} />
      {mode === "signup" && (
        <div>
          <label htmlFor="a-name" className={label}>
            Full name
          </label>
          <input id="a-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className={input} />
        </div>
      )}
      <div>
        <label htmlFor="a-email" className={label}>
          Email
        </label>
        <input id="a-email" name="email" type="email" required autoComplete="email" className={input} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="a-password" className={label}>
            Password
          </label>
          <button type="button" onClick={() => setShow((s) => !s)} className="mb-1.5 text-xs font-semibold text-primary">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="a-password"
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={mode === "signup" ? 8 : 1}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={input}
          aria-describedby={mode === "signup" ? "pw-help" : undefined}
        />
        {mode === "signup" && (
          <p id="pw-help" className="mt-1 text-xs text-muted">
            At least 8 characters.
          </p>
        )}
      </div>
      {guestKeys.length > 0 && (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          Your {guestKeys.length} saved {guestKeys.length === 1 ? "favorite" : "favorites"} will be added to your account.
        </p>
      )}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3`}>
        {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? "New to Africa Discover? " : "Already have an account? "}
        <Link href={`${other}${next !== "/profile" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-primary hover:underline">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
