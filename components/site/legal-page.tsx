import { notFound } from "next/navigation";
import { Article } from "@/components/site/article";
import { readLegal, type LegalSlug } from "@/lib/legal";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { SUPPORT_EMAIL } from "@/lib/site";

/**
 * All three legal pages share one shell: the document, the date it was
 * last changed, and the contact address, which every one of them refers to
 * as "the address below".
 */
export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const { locale, t } = await getI18n();
  const doc = readLegal(slug, locale);
  if (!doc) notFound();

  return (
    <article className="mx-auto w-full max-w-[1180px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
      <h1 className="measure text-[clamp(2rem,5vw,3.1rem)]">{doc.title}</h1>
      <p className="mt-4 font-mono text-xs text-graphite">
        {doc.updated
          ? t("legal.updated", {
              date: formatDate(new Date(doc.updated), locale),
            })
          : ""}
      </p>

      <div className="measure mt-10 rule-top pt-8">
        <Article source={doc.body} />

        <div className="mt-12 rule-top-strong pt-5">
          <p className="eyebrow">{t("site.footer.contact")}</p>
          <p className="mt-2 text-sm text-graphite">
            {t("site.footer.contactBody", { email: SUPPORT_EMAIL })}
          </p>
          <p className="mt-3 text-sm text-graphite">
            {t("legal.ownerPlaceholder")}
          </p>
        </div>
      </div>
    </article>
  );
}
