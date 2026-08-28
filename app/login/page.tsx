import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/forms";
import { GoogleButton } from "@/components/auth/google-button";
import { authMessage } from "@/components/auth/messages";
import { currentUser } from "@/lib/auth/session";
import { googleConfigured } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Logga in – Q86" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (await currentUser()) redirect("/");
  const { next, error } = await searchParams;
  const problem = authMessage(error ?? null);

  return (
    <AuthShell
      title="Logga in"
      lede="Din träning, din data, din plan."
      footer={
        <>
          Har du inget konto?{" "}
          <Link href="/signup" className="text-ballpoint underline">
            Skapa ett
          </Link>
        </>
      }
    >
      {problem && (
        <p role="alert" className="mb-4 text-sm text-redpen">
          {problem}
        </p>
      )}
      <SignInForm next={next} />
      <p className="mt-3 text-center text-xs">
        <Link href="/forgot-password" className="text-graphite underline">
          Glömt lösenordet?
        </Link>
      </p>
      {googleConfigured() && <GoogleButton next={next} />}
    </AuthShell>
  );
}
