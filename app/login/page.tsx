import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/forms";
import { authMessage } from "@/lib/auth/messages";
import { GoogleButton } from "@/components/auth/google-button";
import { currentUser } from "@/lib/auth/session";
import { googleConfigured } from "@/lib/auth/google";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t("auth.signIn")} – Q86` };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  if (await currentUser()) redirect("/");
  const t = await getT();
  const { next, error } = await searchParams;
  const problem = authMessage(t, error ?? null);

  return (
    <AuthShell
      title={t("auth.signIn")}
      lede={t("auth.signInLede")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="text-ballpoint underline">
            {t("auth.createOne")}
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
          {t("auth.forgot")}
        </Link>
      </p>
      {googleConfigured() && <GoogleButton next={next} />}
    </AuthShell>
  );
}
