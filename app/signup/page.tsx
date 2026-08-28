import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/forms";
import { GoogleButton } from "@/components/auth/google-button";
import { currentUser } from "@/lib/auth/session";
import { googleConfigured } from "@/lib/auth/google";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t("auth.signUp")} – Q86` };
}

export default async function SignUpPage() {
  if (await currentUser()) redirect("/");
  const t = await getT();

  return (
    <AuthShell
      title={t("auth.signUp")}
      lede={t("auth.signUpLede")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="text-ballpoint underline">
            {t("auth.signIn")}
          </Link>
        </>
      }
    >
      <SignUpForm />
      {googleConfigured() && <GoogleButton />}
    </AuthShell>
  );
}
