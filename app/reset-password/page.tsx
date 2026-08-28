import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/forms";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t("auth.resetTitle")} – Q86` };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getT();
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title={t("auth.resetMissingTitle")}
        lede={t("auth.resetMissingLede")}
        footer={
          <Link href="/forgot-password" className="text-ballpoint underline">
            {t("auth.requestNewLink")}
          </Link>
        }
      >
        <p className="text-sm text-graphite">{t("auth.resetMissingBody")}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.resetTitle")} lede={t("auth.resetLede")}>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
