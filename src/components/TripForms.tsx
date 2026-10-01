"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { createTripFromForm, deleteTrip, removeStop, reorderStops, updateStop, updateTrip, type FormState } from "@/app/actions";
import { destinationHref, formatDistance, placeLine } from "@/lib/format";
import type { TripDetail } from "@/lib/types";
import { btn, input, label } from "@/lib/ui";
import { Photo } from "./Photo";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "./icons";

export function NewTripForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createTripFromForm, undefined);
  return (
    <form action={action} className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-[family-name:var(--font-sans)] text-lg font-bold tracking-normal">Plan a new trip</h2>
      <div>
        <label htmlFor="trip-title" className={label}>
          Trip name
        </label>
        <input id="trip-title" name="title" required maxLength={120} placeholder="e.g. Kenya safari week" className={input} />
      </div>
      <div>
        <label htmlFor="trip-start" className={label}>
          Start date <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="trip-start" name="startDate" type="date" className={input} />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btn.primary} w-full`}>
        <PlusIcon size={17} /> {pending ? "Creating…" : "Create trip"}
      </button>
    </form>
  );
}

type Stop = TripDetail["stops"][number];

/** Stops of a trip: reorder, remove, set days and notes. Changes save straight away. */
export function TripEditor({ trip }: { trip: TripDetail }) {
  const [stops, setOptimisticStops] = useOptimistic(trip.stops);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<void>, optimistic?: Stop[]) =>
    start(async () => {
      setError(null);
      if (optimistic) setOptimisticStops(optimistic);
      try {
        await fn();
      } catch {
        setError("That change didn't save. Please try again.");
      }
    });

  const move = (i: number, dir: -1 | 1) => {
    const next = [...stops];
    const [s] = next.splice(i, 1);
    next.splice(i + dir, 0, s);
    run(() => reorderStops(trip.id, next.map((x) => x.id)), next);
  };

  if (!stops.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <p className="text-4xl" aria-hidden>
          🗺️
        </p>
        <p className="mt-3 font-semibold text-heading">No stops yet</p>
        <p className="mt-1 text-sm text-muted">Open any destination and choose “Add to trip”.</p>
        <Link href="/explore" className={`${btn.primary} mt-5`}>
          Find destinations
        </Link>
      </div>
    );
  }

  return (
    <div aria-busy={pending}>
      {error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}
      <ol className="space-y-3">
        {stops.map((s, i) => (
          <li key={s.id}>
            {i > 0 && s.legKm > 0 && (
              <p className="mb-2 ml-5 border-l-2 border-dashed border-line pl-6 text-xs text-muted">{formatDistance(s.legKm)?.replace(" away", "")} from the previous stop</p>
            )}
            <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-ink">{i + 1}</span>
                <Photo image={s.destination.image} alt={s.destination.name} sizes="96px" className="hidden aspect-square w-20 shrink-0 rounded-xl sm:block" placeholderEmoji={s.destination.category.emoji} />
                <div className="min-w-0 flex-1">
                  <Link href={destinationHref(s.destination)} className="font-semibold text-heading hover:underline">
                    {s.destination.name}
                  </Link>
                  <p className="text-sm text-muted">{placeLine(s.destination)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-muted">Days</span>
                      <select
                        value={s.days}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          run(() => updateStop(trip.id, s.id, { days }), stops.map((x) => (x.id === s.id ? { ...x, days } : x)));
                        }}
                        className="rounded-lg border border-line bg-surface px-2 py-1"
                      >
                        {Array.from({ length: 14 }, (_, n) => n + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  <button type="button" disabled={i === 0 || pending} onClick={() => move(i, -1)} className={`${btn.icon} disabled:opacity-30`} aria-label={`Move ${s.destination.name} up`}>
                    <ArrowUpIcon size={18} />
                  </button>
                  <button type="button" disabled={i === stops.length - 1 || pending} onClick={() => move(i, 1)} className={`${btn.icon} disabled:opacity-30`} aria-label={`Move ${s.destination.name} down`}>
                    <ArrowDownIcon size={18} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => removeStop(trip.id, s.id), stops.filter((x) => x.id !== s.id))}
                    className={`${btn.icon} text-danger`}
                    aria-label={`Remove ${s.destination.name} from trip`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
              <StopNotes tripId={trip.id} stop={s} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StopNotes({ tripId, stop }: { tripId: number; stop: Stop }) {
  const [value, setValue] = useState(stop.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const dirty = value !== (stop.notes ?? "");
  return (
    <div className="mt-3 sm:pl-12">
      <label htmlFor={`notes-${stop.id}`} className="sr-only">
        Notes for {stop.destination.name}
      </label>
      <textarea
        id={`notes-${stop.id}`}
        value={value}
        maxLength={1000}
        rows={2}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="Add notes: bookings, guides to contact, what to pack…"
        className={`${input} text-sm`}
      />
      {(dirty || saved) && (
        <div className="mt-2 flex items-center gap-3">
          {dirty && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await updateStop(tripId, stop.id, { notes: value });
                  setSaved(true);
                })
              }
              className={`${btn.secondary} px-4 py-1.5`}
            >
              {pending ? "Saving…" : "Save note"}
            </button>
          )}
          {saved && !dirty && <span className="text-xs text-muted">Saved</span>}
        </div>
      )}
    </div>
  );
}

/** Rename, set the start date, or delete the whole trip. */
export function TripSettings({ trip }: { trip: TripDetail }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <details className="rounded-2xl border border-line bg-surface p-5">
      <summary className="cursor-pointer font-semibold text-heading">Trip settings</summary>
      <form
        className="mt-4 space-y-3"
        action={(form) =>
          start(async () => {
            await updateTrip(trip.id, { title: String(form.get("title")), startDate: String(form.get("startDate") || "") || undefined, notes: String(form.get("notes") ?? "") });
          })
        }
      >
        <div>
          <label htmlFor="t-title" className={label}>
            Name
          </label>
          <input id="t-title" name="title" defaultValue={trip.title} required maxLength={120} className={input} />
        </div>
        <div>
          <label htmlFor="t-start" className={label}>
            Start date
          </label>
          <input id="t-start" name="startDate" type="date" defaultValue={trip.startDate ?? ""} className={input} />
        </div>
        <div>
          <label htmlFor="t-notes" className={label}>
            Trip notes
          </label>
          <textarea id="t-notes" name="notes" defaultValue={trip.notes ?? ""} rows={3} maxLength={2000} className={input} />
        </div>
        <button type="submit" disabled={pending} className={btn.primary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
      <div className="mt-6 border-t border-line pt-4">
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Delete “{trip.title}” for good?</span>
            <button type="button" onClick={() => start(() => deleteTrip(trip.id))} className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white">
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirm(false)} className={btn.ghost}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="text-sm font-semibold text-danger hover:underline">
            Delete this trip
          </button>
        )}
      </div>
    </details>
  );
}
