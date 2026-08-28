import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Glömt lösenord – Q86" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Glömt lösenordet"
      lede="Ange din e-postadress så skickar vi en länk för att välja ett nytt."
      footer={
        <Link href="/login" className="text-ballpoint underline">
          Tillbaka till inloggningen
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
