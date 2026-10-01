import { notFound } from "next/navigation";

// Any unknown URL under /en or /fr shows the not-found page.
export default function CatchAll() {
  notFound();
}
