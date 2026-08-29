import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/article";
import { GUIDE_SLUGS, readGuide } from "@/lib/guides";
import { getI18n } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/locale";
import { formatDate } from "@/lib/i18n/format";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = readGuide(slug, await getLocale());
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: absoluteUrl(`/guider/${guide.slug}`) },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: absoluteUrl(`/guider/${guide.slug}`),
      modifiedTime: guide.updated || undefined,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const guide = readGuide(slug, locale);
  if (!guide) notFound();

  // Structured data for the article itself. Emitted as a JSON string with
  // the closing-tag sequence escaped, so no field can break out of the
  // script element.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    inLanguage: guide.locale === "sv" ? "sv-SE" : "en-GB",
    dateModified: guide.updated || undefined,
    mainEntityOfPage: absoluteUrl(`/guider/${guide.slug}`),
    author: { "@type": "Organization", name: "Q86" },
    publisher: { "@type": "Organization", name: "Q86" },
  }).replace(/</g, "\\u003c");

  return (
    <article className="mx-auto w-full max-w-[1180px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Link
        href="/guider"
        className="font-mono text-xs text-graphite transition-colors hover:text-ink"
      >
        {t("guides.backToGuides")}
      </Link>

      <h1 className="measure mt-6 text-[clamp(2rem,5vw,3.1rem)]">
        {guide.title}
      </h1>
      <p className="measure mt-4 text-lg leading-relaxed text-graphite">
        {guide.summary}
      </p>
      <p className="mt-5 font-mono text-xs text-graphite">
        {t("guides.readingTime", { minutes: guide.minutes })}
        {guide.updated
          ? ` · ${t("guides.updated", { date: formatDate(new Date(guide.updated), locale) })}`
          : ""}
      </p>

      {guide.fallback && (
        <p className="mt-6 rounded-card border border-grid bg-surface px-4 py-3 text-sm text-graphite">
          {t("fallback.textInOtherLanguage")}
        </p>
      )}

      <div className="measure mt-10 rule-top pt-8">
        <Article source={guide.body} />
      </div>

      <div className="measure mt-14 rule-top-strong pt-6">
        <h2 className="text-xl">{t("guides.ctaTitle")}</h2>
        <p className="mt-2 text-sm text-graphite">{t("guides.ctaBody")}</p>
        <Link
          href="/diagnos"
          className="mt-4 inline-block rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {t("guides.ctaButton")}
        </Link>
      </div>
    </article>
  );
}
