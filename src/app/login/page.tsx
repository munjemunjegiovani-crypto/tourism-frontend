import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionToken } from "@/lib/api";
import { AuthForm } from "@/components/AuthForm";
import { AuthLayout, authImage } from "@/components/AuthLayout";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

const safe = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/profile");

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safe((await searchParams).next);
  if (await sessionToken()) redirect(next);
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your saved places, trips and reviews." image={await authImage()}>
      <AuthForm mode="login" next={next} />
    </AuthLayout>
  );
}
