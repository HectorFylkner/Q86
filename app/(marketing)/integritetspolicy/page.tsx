import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { readLegal } from "@/lib/legal";
import { getLocale } from "@/lib/i18n/locale";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const doc = readLegal("integritetspolicy", await getLocale());
  return {
    title: doc?.title,
    alternates: { canonical: absoluteUrl("/integritetspolicy") },
    // Legal text is not what anyone should reach Q86 by searching for.
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <LegalPage slug="integritetspolicy" />;
}
