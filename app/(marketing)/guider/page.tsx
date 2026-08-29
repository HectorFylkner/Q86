import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { listGuides } from "@/lib/guides";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/guider") },
};

export default async function GuidesIndexPage() {
  const { locale, t } = await getI18n();
  const guides = listGuides(locale);

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-4 pt-14 sm:px-8 sm:pt-20">
        <p className="eyebrow">{t("site.nav.guides")}</p>
        <h1 className="mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)]">
          {t("guides.title")}
        </h1>
        <p className="measure mt-5 text-lg leading-relaxed text-graphite">
          {t("guides.lede")}
        </p>
      </div>

      <Section rule={false} wide>
        <ul>
          {guides.map((guide) => (
            <li key={guide.slug} className="rule-top">
              <Link
                href={`/guider/${guide.slug}`}
                className="group grid gap-2 py-7 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
              >
                <div>
                  <h2 className="text-2xl transition-colors group-hover:text-ballpoint">
                    {guide.title}
                  </h2>
                  <p className="measure mt-2 text-base leading-relaxed text-graphite">
                    {guide.summary}
                  </p>
                </div>
                <p className="whitespace-nowrap font-mono text-xs text-graphite">
                  {t("guides.readingTime", { minutes: guide.minutes })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("guides.ctaTitle")} lede={t("guides.ctaBody")}>
        <Link
          href="/diagnos"
          className="inline-block rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {t("guides.ctaButton")}
        </Link>
        <p className="mt-6 font-mono text-xs text-graphite">
          {guides.length > 0 && guides[0].updated
            ? t("guides.updated", {
                date: formatDate(new Date(guides[0].updated), locale),
              })
            : ""}
        </p>
      </Section>
    </>
  );
}
