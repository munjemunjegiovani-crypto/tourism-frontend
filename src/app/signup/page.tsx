import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessionToken } from "@/lib/api";
import { AuthForm } from "@/components/AuthForm";
import { AuthLayout, authImage } from "@/components/AuthLayout";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

const safe = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/profile");

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safe((await searchParams).next);
  if (await sessionToken()) redirect(next);
  return (
    <AuthLayout title="Join Africa Discover" subtitle="Save places, plan trips and share reviews. It’s free." image={await authImage()}>
      <AuthForm mode="signup" next={next} />
    </AuthLayout>
  );
}
