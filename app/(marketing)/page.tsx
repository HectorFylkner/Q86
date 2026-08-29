import Link from "next/link";
import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { Reveal, StaggeredLines } from "@/components/site/reveal";
import { Section } from "@/components/site/section";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { getI18n } from "@/lib/i18n/server";
import { formatNumber } from "@/lib/i18n/format";
import { skillLabel } from "@/lib/i18n/labels";
import { listLessons } from "@/lib/lessons";
import { absoluteUrl } from "@/lib/site";
import { ALL_SUBTOPICS, FUNDAMENTAL_SKILLS } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
};

export default async function LandingPage() {
  const { locale, t } = await getI18n();

  // The proof row states counts, so it reads them rather than asserting
  // them: a number on a marketing page that drifts from the product is a
  // false claim, however small.
  const verified =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;
  const chapters = listLessons(locale).length;

  const heroLines = t("site.hero.title").split(". ");
  const lines =
    heroLines.length > 1
      ? [`${heroLines[0]}.`, heroLines.slice(1).join(". ")]
      : heroLines;

  return (
    <>
      {/* Hero ------------------------------------------------------- */}
      <div className="editorial-grid-band">
        <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <p className="eyebrow">{t("site.hero.eyebrow")}</p>
          <h1 className="mt-5 max-w-[16ch] text-[clamp(2.4rem,7vw,4.6rem)]">
            <StaggeredLines lines={lines} />
          </h1>
          <p className="measure mt-7 text-lg leading-relaxed text-graphite sm:text-xl">
            {t("site.hero.lede")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/diagnos"
              className="rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              {t("site.hero.primary")}
            </Link>
            <Link
              href="/priser"
              className="rounded-control border border-grid bg-surface px-5 py-3 text-sm font-medium transition-colors hover:border-graphite"
            >
              {t("site.hero.secondary")}
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-graphite">
            {t("site.hero.note")}
          </p>
        </div>
      </div>

      {/* Proof row -------------------------------------------------- */}
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-grid bg-grid lg:grid-cols-4">
          {[
            [formatNumber(verified, locale), t("site.proof.questions")],
            [formatNumber(chapters, locale), t("site.proof.chapters")],
            [
              formatNumber(FUNDAMENTAL_SKILLS.length, locale),
              t("site.proof.skills"),
            ],
            [
              formatNumber(ALL_SUBTOPICS.length, locale),
              t("site.proof.subtopics"),
            ],
          ].map(([value, label]) => (
            <div key={label} className="bg-paper px-5 py-6">
              <dd className="font-display text-3xl font-bold tracking-tight">
                {value}
              </dd>
              <dt className="mt-1 text-sm text-graphite">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      {/* The problem ------------------------------------------------ */}
      <Section
        eyebrow={t("site.nav.product")}
        title={t("site.problem.title")}
        className="[&>div]:pb-10"
        rule={false}
      >
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <p className="text-lg leading-relaxed">{t("site.problem.body")}</p>
          <p className="rule-top-strong pt-5 text-base leading-relaxed text-graphite">
            {t("site.problem.answer")}
          </p>
        </div>
      </Section>

      {/* Three pillars ---------------------------------------------- */}
      <Section title={t("site.pillars.title")}>
        <div className="grid gap-px overflow-hidden rounded-card border border-grid bg-grid lg:grid-cols-3">
          {[
            [t("site.pillars.verifiedTitle"), t("site.pillars.verifiedBody")],
            [t("site.pillars.taxonomyTitle"), t("site.pillars.taxonomyBody")],
            [t("site.pillars.planTitle"), t("site.pillars.planBody")],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.08} className="bg-paper">
              <div className="h-full px-6 py-7">
                <p className="font-mono text-xs text-graphite">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The loop --------------------------------------------------- */}
      <Section eyebrow={t("site.method.title")} title={t("site.method.lede")}>
        <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {[
            [t("site.method.readTitle"), t("site.method.readBody")],
            [t("site.method.drillTitle"), t("site.method.drillBody")],
            [t("site.method.markTitle"), t("site.method.markBody")],
            [t("site.method.returnTitle"), t("site.method.returnBody")],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.06}>
              <li className="rule-top pt-5">
                <span className="font-mono text-xs text-graphite">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">
                  {body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* What the exam measures ------------------------------------- */}
      <Section eyebrow="GMAT Focus" title={t("site.proof.skills")}>
        <ul className="grid gap-px overflow-hidden rounded-card border border-grid bg-grid sm:grid-cols-2">
          {FUNDAMENTAL_SKILLS.map((skill) => (
            <li key={skill} className="bg-paper px-6 py-5">
              <p className="font-display text-base font-semibold">
                {skillLabel(t, skill)}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* The bank --------------------------------------------------- */}
      <Section title={t("site.bank.title")}>
        <p className="measure text-lg leading-relaxed">{t("site.bank.body")}</p>
      </Section>

      {/* What we do not promise ------------------------------------- */}
      <Section eyebrow={t("site.honesty.title")}>
        <ul className="grid gap-6 sm:grid-cols-2">
          {[
            t("site.honesty.noGuarantee"),
            t("site.honesty.noOfficial"),
            t("site.honesty.noTestimonials"),
            t("site.honesty.noVerbal"),
          ].map((line) => (
            <li key={line} className="rule-top pt-4 text-sm leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
      </Section>

      {/* Close ------------------------------------------------------ */}
      <Section title={t("site.cta.title")} lede={t("site.cta.body")}>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/diagnos"
            className="rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            {t("site.cta.button")}
          </Link>
          <Link
            href="/guider"
            className="text-sm text-graphite underline underline-offset-4 transition-colors hover:text-ink"
          >
            {t("site.cta.alt")}
          </Link>
        </div>
      </Section>
    </>
  );
}
