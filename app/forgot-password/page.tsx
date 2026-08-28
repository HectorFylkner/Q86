import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forms";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t("auth.forgotTitle")} – Q86` };
}

export default async function ForgotPasswordPage() {
  const t = await getT();
  return (
    <AuthShell
      title={t("auth.forgotTitle")}
      lede={t("auth.forgotLede")}
      footer={
        <Link href="/login" className="text-ballpoint underline">
          {t("auth.backToSignIn")}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
