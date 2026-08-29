import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { cardForCode } from "@/lib/retention/share";
import { getI18n } from "@/lib/i18n/server";
import { formatNumber, formatPercent } from "@/lib/i18n/format";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    alternates: { canonical: absoluteUrl(`/kort/${code}`) },
    // A shared card is for the people it was shared with, not for a
    // search index: the owner chose an audience, not publication.
    robots: { index: false, follow: false },
  };
}

export default async function ProgressCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { locale, t } = await getI18n();
  const card = await cardForCode(code);

  if (!card) {
    return (
      <Section title={t("progressCard.title")} rule={false}>
        <p className="measure text-lg text-graphite">
          {t("progressCard.notFound")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper"
        >
          Q86
        </Link>
      </Section>
    );
  }

  const stats: Array<[string, string]> = [
    [formatNumber(card.streak, locale), t("progressCard.streakDays")],
    [formatNumber(card.attempts, locale), t("progressCard.questions")],
    [formatPercent(card.accuracy, locale), t("progressCard.accuracy")],
    [formatNumber(card.chapters, locale), t("progressCard.chapters")],
  ];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <p className="eyebrow">{t("progressCard.subheading")}</p>
      <h1 className="mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)]">
        {t("progressCard.heading", { days: card.streak })}
      </h1>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-grid bg-grid lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="bg-paper px-5 py-6">
            <dd className="font-display text-4xl font-bold tracking-tight">
              {value}
            </dd>
            <dt className="mt-1 text-sm text-graphite">{label}</dt>
          </div>
        ))}
      </dl>

      {card.daysToTest !== null && (
        <p className="mt-4 font-mono text-xs text-graphite">
          {card.daysToTest} {t("progressCard.daysToTest")}
        </p>
      )}

      <div className="mt-14 rule-top-strong pt-6">
        <h2 className="text-2xl">{t("progressCard.visitorCta")}</h2>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            href="/diagnos"
            className="rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            {t("site.cta.button")}
          </Link>
          <Link
            href="/"
            className="text-sm text-graphite underline underline-offset-4 transition-colors hover:text-ink"
          >
            Q86
          </Link>
        </div>
      </div>
    </div>
  );
}
