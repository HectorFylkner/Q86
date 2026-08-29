import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { currentUser } from "@/lib/auth/session";
import {
  PLANS,
  PLAN_ORDER,
  VAT_RATE,
  monthlyEquivalentOre,
  type Plan,
} from "@/lib/billing/pricing";
import { getI18n } from "@/lib/i18n/server";
import { formatCurrency, formatPercent } from "@/lib/i18n/format";
import type { Key } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/priser") },
};

export default async function PricingPage() {
  const { locale, t } = await getI18n();
  const user = await currentUser();
  const vat = formatPercent(VAT_RATE, locale, 0);

  const faq: Array<[Key, Key]> = [
    ["pricing.faq.cancelQ", "pricing.faq.cancelA"],
    ["pricing.faq.sprintQ", "pricing.faq.sprintA"],
    ["pricing.faq.vatQ", "pricing.faq.vatA"],
    ["pricing.faq.refundQ", "pricing.faq.refundA"],
    ["pricing.faq.dataQ", "pricing.faq.dataA"],
  ];

  function priceLine(plan: Plan): { amount: string; unit: string } {
    if (plan.priceOre === 0) {
      return { amount: t("pricing.free"), unit: "" };
    }
    if (plan.billing === "one_time") {
      return {
        amount: formatCurrency(plan.priceOre, locale),
        unit: t("pricing.forMonths", { months: plan.durationMonths ?? 0 }),
      };
    }
    return {
      amount: formatCurrency(plan.priceOre, locale),
      unit: t("pricing.perMonth"),
    };
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <p className="eyebrow">{t("site.nav.pricing")}</p>
        <h1 className="mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)]">
          {t("pricing.title")}
        </h1>
        <p className="measure mt-5 text-lg leading-relaxed text-graphite">
          {t("pricing.lede")}
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-card border border-grid bg-grid lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const { amount, unit } = priceLine(plan);
            const monthly = monthlyEquivalentOre(plan);
            return (
              <div key={plan.id} className="flex flex-col bg-paper px-6 py-8">
                <h2 className="font-display text-xl font-semibold">
                  {t(`billing.plans.${plan.id}.name` as Key)}
                </h2>
                <p className="mt-1 text-sm text-graphite">
                  {t(`billing.plans.${plan.id}.tagline` as Key)}
                </p>

                <p className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {amount}
                  </span>
                  {unit && (
                    <span className="text-sm text-graphite">{unit}</span>
                  )}
                </p>
                {plan.billing === "one_time" && (
                  <p className="mt-1 font-mono text-xs text-graphite">
                    {t("pricing.monthlyEquivalent", {
                      amount: formatCurrency(monthly, locale),
                    })}
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {Array.from({ length: plan.bulletCount }, (_, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden className="text-ballpoint">
                        ·
                      </span>
                      <span>
                        {t(`billing.plans.${plan.id}.bullet${i + 1}` as Key)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.id === "free" ? (
                    <Link
                      href={user ? "/idag" : "/signup"}
                      className="block rounded-control border border-grid bg-surface px-4 py-2.5 text-center text-sm font-medium transition-colors hover:border-graphite"
                    >
                      {t("pricing.startFree")}
                    </Link>
                  ) : (
                    <Link
                      href={user ? "/konto" : "/signup"}
                      className="block rounded-control bg-ink px-4 py-2.5 text-center text-sm font-medium text-paper transition-opacity hover:opacity-90"
                    >
                      {t("pricing.choose", {
                        plan: t(`billing.plans.${plan.id}.name` as Key),
                      })}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 font-mono text-xs text-graphite">
          {t("pricing.vatNote", { rate: vat })}
        </p>
      </div>

      <Section title={t("pricing.faqTitle")}>
        <dl className="grid gap-8 sm:grid-cols-2">
          {faq.map(([question, answer]) => (
            <div key={question} className="rule-top pt-5">
              <dt className="font-display text-base font-semibold">
                {t(question)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-graphite">
                {t(answer, { rate: vat })}
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
