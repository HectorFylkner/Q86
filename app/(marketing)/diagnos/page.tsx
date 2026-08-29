import type { Metadata } from "next";
import { DiagnosticClient } from "@/components/site/diagnostic-client";
import { diagnosticQuestions } from "@/lib/diagnostic";
import { getT } from "@/lib/i18n/server";
import { absoluteUrl } from "@/lib/site";
import { previewWeekAction } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/diagnos") },
};

export default async function DiagnosticPage() {
  const t = await getT();
  const questions = await diagnosticQuestions();

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <p className="eyebrow">{t("site.nav.diagnostic")}</p>
      <h1 className="mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)]">
        {t("diagnostic.title")}
      </h1>

      <div className="mt-10">
        <DiagnosticClient
          questions={questions}
          previewFor={previewWeekAction}
        />
      </div>
    </div>
  );
}
