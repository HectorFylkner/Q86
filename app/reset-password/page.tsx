import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/forms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Nytt lösenord – Q86" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title="Länken saknas"
        lede="Öppna länken från mejlet, eller begär en ny återställning."
        footer={
          <Link href="/forgot-password" className="text-ballpoint underline">
            Begär en ny länk
          </Link>
        }
      >
        <p className="text-sm text-graphite">
          Adressen innehöll ingen återställningstoken.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Välj ett nytt lösenord"
      lede="Alla andra inloggade enheter loggas ut när du sparar."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
