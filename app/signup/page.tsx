import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/forms";
import { GoogleButton } from "@/components/auth/google-button";
import { currentUser } from "@/lib/auth/session";
import { googleConfigured } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Skapa konto – Q86" };

export default async function SignUpPage() {
  if (await currentUser()) redirect("/");

  return (
    <AuthShell
      title="Skapa konto"
      lede="Svensk undervisning, engelska frågor — som på provet."
      footer={
        <>
          Har du redan ett konto?{" "}
          <Link href="/login" className="text-ballpoint underline">
            Logga in
          </Link>
        </>
      }
    >
      <SignUpForm />
      {googleConfigured() && <GoogleButton />}
    </AuthShell>
  );
}
