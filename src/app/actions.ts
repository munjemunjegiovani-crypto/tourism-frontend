"use server";

/**
 * Server actions: the browser calls these, they call the backend with the session cookie.
 * Keeping the token in an httpOnly cookie on this domain means page scripts never see it.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import { SAMPLE_TRIP, SESSION_COOKIE } from "@/lib/config";
import type { DestinationCard, ExperienceSummary, TripSummary, User } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean; message?: string } | undefined;

const safeNext = (next: FormDataEntryValue | null) => {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/profile";
};

async function startSession(token: string, expiresAt: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Favourites saved before logging in (from localStorage) are merged into the account. */
async function importGuestFavorites(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw) return;
  try {
    const keys = JSON.parse(raw) as string[];
    const items = keys
      .map((k) => k.split(":"))
      .filter((p) => p.length === 2 && ["destination", "experience", "place"].includes(p[0]))
      .map(([kind, slug]) => ({ kind, slug }));
    if (items.length) await api.send("/me/favorites/import", "POST", { items: items.slice(0, 200) });
  } catch {
    // Not critical: the visitor can save them again
  }
}

const message = (e: unknown) =>
  e instanceof ApiError ? e.message : "We couldn't reach Africa Discover's servers. Check your connection and try again.";

export async function login(_: FormState, form: FormData): Promise<FormState> {
  try {
    const { data } = await api.send<{ data: { user: User; token: string; expiresAt: string } }>("/auth/login", "POST", {
      email: form.get("email"),
      password: form.get("password"),
    });
    await startSession(data.token, data.expiresAt);
  } catch (e) {
    return { error: message(e) };
  }
  await importGuestFavorites(form.get("guestFavorites"));
  redirect(safeNext(form.get("next")));
}

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  try {
    const { data } = await api.send<{ data: { user: User; token: string; expiresAt: string } }>("/auth/register", "POST", {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });
    await startSession(data.token, data.expiresAt);
  } catch (e) {
    return { error: message(e) };
  }
  await importGuestFavorites(form.get("guestFavorites"));
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  try {
    await api.send("/auth/logout", "POST");
  } catch {
    // Session may already be gone; clear the cookie anyway
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

/* ---------- Favourites ---------- */

export async function setFavorite(kind: "destination" | "experience" | "place", slug: string, on: boolean, list: "saved" | "visited" = "saved") {
  if (on) await api.send("/me/favorites", "POST", { kind, slug, list });
  else await api.send(`/me/favorites/${kind}/${slug}?list=${list}`, "DELETE");
  revalidatePath("/favorites");
  revalidatePath("/profile");
}

/** For guests: turn favourite keys stored in the browser into cards. */
export async function cardsForKeys(keys: string[]): Promise<{ destinations: DestinationCard[]; experiences: ExperienceSummary[] }> {
  const slugs = (kind: string) => keys.filter((k) => k.startsWith(`${kind}:`)).map((k) => k.slice(kind.length + 1)).slice(0, 100);
  const destSlugs = slugs("destination");
  const expSlugs = new Set(slugs("experience"));
  const [dest, exps] = await Promise.all([
    destSlugs.length ? api.destinations({ slugs: destSlugs, limit: 100 }) : { data: [] as DestinationCard[] },
    expSlugs.size ? api.experiences() : ([] as ExperienceSummary[]),
  ]);
  return { destinations: dest.data, experiences: exps.filter((e) => expSlugs.has(e.slug)) };
}

/* ---------- Trips ---------- */

export async function myTrips(): Promise<TripSummary[]> {
  try {
    return await api.trips();
  } catch {
    return [];
  }
}

export async function createTrip(title: string, destinationSlug?: string, startDate?: string) {
  const { data } = await api.send<{ data: { id: number } }>("/me/trips", "POST", { title, destinationSlug, startDate });
  revalidatePath("/trip");
  return data.id;
}

export async function createTripFromForm(_: FormState, form: FormData): Promise<FormState> {
  let id: number;
  try {
    id = await createTrip(String(form.get("title") ?? ""), undefined, String(form.get("startDate") ?? "") || undefined);
  } catch (e) {
    return { error: message(e) };
  }
  redirect(`/trip/${id}`);
}

/** Copy the example itinerary from the trip planner into the member's account. */
export async function createSampleTrip() {
  let id: number;
  try {
    id = await createTrip(SAMPLE_TRIP.title, SAMPLE_TRIP.stops[0]);
    for (const slug of SAMPLE_TRIP.stops.slice(1)) await api.send(`/me/trips/${id}/stops`, "POST", { destinationSlug: slug });
  } catch {
    redirect("/trip?error=1");
  }
  redirect(`/trip/${id}`);
}

export async function addToTrip(tripId: number, destinationSlug: string) {
  await api.send(`/me/trips/${tripId}/stops`, "POST", { destinationSlug });
  revalidatePath(`/trip/${tripId}`);
}

export async function updateStop(tripId: number, stopId: number, patch: { days?: number; notes?: string }) {
  await api.send(`/me/trips/${tripId}/stops/${stopId}`, "PATCH", patch);
  refresh();
}

export async function removeStop(tripId: number, stopId: number) {
  await api.send(`/me/trips/${tripId}/stops/${stopId}`, "DELETE");
  refresh();
}

export async function reorderStops(tripId: number, stopIds: number[]) {
  await api.send(`/me/trips/${tripId}/reorder`, "POST", { stopIds });
  refresh();
}

export async function updateTrip(tripId: number, patch: { title?: string; startDate?: string; notes?: string }) {
  await api.send(`/me/trips/${tripId}`, "PATCH", patch);
  refresh();
}

export async function deleteTrip(tripId: number) {
  await api.send(`/me/trips/${tripId}`, "DELETE");
  revalidatePath("/trip");
  redirect("/trip");
}

/* ---------- Reviews ---------- */

export async function submitReview(_: FormState, form: FormData): Promise<FormState> {
  const slug = String(form.get("slug"));
  try {
    await api.send(`/destinations/${slug}/reviews`, "POST", {
      rating: Number(form.get("rating")),
      title: form.get("title"),
      body: form.get("body"),
      visitedOn: form.get("visitedOn") || undefined,
    });
  } catch (e) {
    return { error: message(e) };
  }
  refresh();
  return { ok: true, message: "Thanks! Your review is published." };
}

/* ---------- Profile ---------- */

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  try {
    await api.send("/me", "PATCH", {
      name: form.get("name"),
      avatarUrl: form.get("avatarUrl") ?? "",
      homeCity: form.get("homeCity") ?? "",
    });
  } catch (e) {
    return { error: message(e) };
  }
  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  try {
    await api.send("/me/password", "POST", { current: form.get("current"), next: form.get("next") });
  } catch (e) {
    return { error: message(e) };
  }
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

export async function deleteAccount() {
  await api.send("/me", "DELETE");
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
