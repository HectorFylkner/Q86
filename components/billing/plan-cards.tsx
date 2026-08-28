"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { formatCurrency } from "@/lib/i18n/format";
import type { Key } from "@/lib/i18n";
import {
  monthlyEquivalentOre,
  PLAN_ORDER,
  PLANS,
  vatBreakdown,
  type PlanId,
} from "@/lib/billing/pricing";
import { cn } from "@/lib/utils";

/**
 * The three plans, as a comparison rather than an upsell. The VAT line is
 * shown on every card because prisinformationslagen requires the consumer
 * price to be the price paid, and saying so is also just clearer.
 */
export function PlanCards({
  currentPlan,
  billingEnabled,
  highlight,
}: {
  currentPlan: PlanId;
  billingEnabled: boolean;
  highlight?: PlanId;
}) {
  const { locale, t } = useI18n();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: PlanId) {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (res.status === 503) {
        setError(t("billing.checkoutUnavailable"));
        return;
      }
      if (!res.ok || !body.url) {
        setError(t("billing.checkoutFailed"));
        return;
      }
      window.location.href = body.url;
    } catch {
      setError(t("billing.checkoutUnreachable"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const vat = vatBreakdown(plan.priceOre);
          const isCurrent = id === currentPlan;
          const featured = id === (highlight ?? "sprint");
          const name = t(`billing.plans.${id}.name` as Key);
          const bullets = Array.from(
            { length: plan.bulletCount },
            (_unused, index) =>
              t(`billing.plans.${id}.bullet${index + 1}` as Key, {
                limit: plan.dailyQuestionLimit ?? 0,
                monthly: formatCurrency(monthlyEquivalentOre(plan), locale),
              }),
          );

          return (
            <section
              key={id}
              className={cn(
                "flex flex-col rounded-card border bg-surface p-5 shadow-ambient",
                featured ? "border-ballpoint" : "border-grid",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold">{name}</h3>
                {isCurrent && (
                  <span className="rounded-control bg-highlight px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                    {t("billing.yourPlan")}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-graphite">
                {t(`billing.plans.${id}.tagline` as Key)}
              </p>

              <div className="mt-4">
                <span className="font-display text-3xl font-semibold tabular-nums">
                  {formatCurrency(plan.priceOre, locale)}
                </span>
                {plan.billing === "recurring_month" && (
                  <span className="ml-1 text-sm text-graphite">
                    {t("billing.perMonth")}
                  </span>
                )}
                {plan.billing === "one_time" && (
                  <span className="ml-1 text-sm text-graphite">
                    {t("billing.forMonths", {
                      months: plan.durationMonths ?? 0,
                    })}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] text-graphite">
                {plan.priceOre === 0
                  ? t("billing.noPayment")
                  : t("billing.vatIncluded", {
                      amount: formatCurrency(vat.vatOre, locale),
                    }) +
                    (plan.billing === "one_time"
                      ? ` · ${t("billing.monthlyEquivalent", {
                          amount: formatCurrency(
                            monthlyEquivalentOre(plan),
                            locale,
                          ),
                        })}`
                      : "")}
              </p>

              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span aria-hidden="true" className="text-ballpoint">
                      ·
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {id === "free" ? (
                  <p className="text-center font-mono text-[11px] text-graphite">
                    {isCurrent
                      ? t("billing.active")
                      : t("billing.alwaysAvailable")}
                  </p>
                ) : isCurrent ? (
                  <p className="text-center font-mono text-[11px] text-graphite">
                    {t("billing.manageBelow")}
                  </p>
                ) : (
                  <button
                    onClick={() => startCheckout(id)}
                    disabled={busy !== null || !billingEnabled}
                    className={cn(
                      "w-full rounded-control px-4 py-2.5 text-sm font-medium transition-opacity",
                      featured
                        ? "bg-ballpoint text-white hover:opacity-90"
                        : "border border-grid text-ink hover:border-graphite/50",
                      (busy !== null || !billingEnabled) && "opacity-60",
                    )}
                  >
                    {busy === id
                      ? t("billing.openingCheckout")
                      : t("billing.choose", { plan: name })}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {!billingEnabled && (
        <p className="mt-4 text-sm text-amber">{t("billing.unconfigured")}</p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-redpen">
          {error}
        </p>
      )}
    </div>
  );
}
