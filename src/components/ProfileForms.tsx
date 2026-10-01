"use client";

import { useActionState, useState, useTransition } from "react";
import { changePassword, deleteAccount, logout, updateProfile, type FormState } from "@/app/actions";
import type { User } from "@/lib/types";
import { btn, input, label } from "@/lib/ui";

function Status({ state }: { state: FormState }) {
  if (state?.error)
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  if (state?.message)
    return (
      <p role="status" className="text-sm text-primary">
        {state.message}
      </p>
    );
  return null;
}

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="p-name" className={label}>
          Name
        </label>
        <input id="p-name" name="name" defaultValue={user.name} required minLength={2} maxLength={80} autoComplete="name" className={input} />
      </div>
      <div>
        <label htmlFor="p-email" className={label}>
          Email
        </label>
        <input id="p-email" value={user.email} readOnly disabled className={`${input} opacity-70`} />
      </div>
      <div>
        <label htmlFor="p-city" className={label}>
          Home city <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="p-city" name="homeCity" defaultValue={user.homeCity ?? ""} maxLength={80} placeholder="e.g. Douala" className={input} />
      </div>
      <div>
        <label htmlFor="p-avatar" className={label}>
          Profile photo URL <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="p-avatar" name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ""} placeholder="https://…" className={input} />
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className={btn.primary}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="pw-current" className={label}>
          Current password
        </label>
        <input id="pw-current" name="current" type="password" required autoComplete="current-password" className={input} />
      </div>
      <div>
        <label htmlFor="pw-next" className={label}>
          New password
        </label>
        <input id="pw-next" name="next" type="password" required minLength={8} autoComplete="new-password" className={input} />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      <Status state={state} />
      <button type="submit" disabled={pending} className={btn.secondary}>
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

export function AccountButtons() {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-4">
      <button type="button" disabled={pending} onClick={() => start(() => logout())} className={btn.secondary}>
        Log out
      </button>
      <div className="border-t border-line pt-4">
        {confirm ? (
          <div className="space-y-3">
            <p className="text-sm">This permanently deletes your account, favorites, trips and reviews.</p>
            <div className="flex gap-2">
              <button type="button" disabled={pending} onClick={() => start(() => deleteAccount())} className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white">
                Delete my account
              </button>
              <button type="button" onClick={() => setConfirm(false)} className={btn.ghost}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="text-sm font-semibold text-danger hover:underline">
            Delete account
          </button>
        )}
      </div>
    </div>
  );
}
