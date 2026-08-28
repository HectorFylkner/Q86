"use client";

import { useState } from "react";
import {
  formatPrice,
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
        setError(
          "Betalningar är inte aktiverade på den här servern ännu. " +
            "Hör av dig så öppnar vi ett konto åt dig manuellt.",
        );
        return;
      }
      if (!res.ok || !body.url) {
        setError("Det gick inte att öppna kassan. Försök igen om en stund.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Det gick inte att nå betalningstjänsten. Kontrollera nätet.");
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
          return (
            <section
              key={id}
              className={cn(
                "flex flex-col rounded-card border bg-surface p-5 shadow-ambient",
                featured ? "border-ballpoint" : "border-grid",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold">
                  {plan.name}
                </h3>
                {isCurrent && (
                  <span className="rounded-control bg-highlight px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink">
                    Din plan
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-graphite">{plan.tagline}</p>

              <div className="mt-4">
                <span className="font-display text-3xl font-semibold tabular-nums">
                  {formatPrice(plan.priceOre)}
                </span>
                {plan.billing === "recurring_month" && (
                  <span className="ml-1 text-sm text-graphite">/ månad</span>
                )}
                {plan.billing === "one_time" && (
                  <span className="ml-1 text-sm text-graphite">
                    / {plan.durationMonths} månader
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] text-graphite">
                {plan.priceOre === 0
                  ? "Ingen betalning, inget kort"
                  : `inkl. ${formatPrice(vat.vatOre)} moms` +
                    (plan.billing === "one_time"
                      ? ` · ${formatPrice(monthlyEquivalentOre(plan))}/mån`
                      : "")}
              </p>

              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {plan.bullets.map((bullet) => (
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
                    {isCurrent ? "Aktiv" : "Alltid tillgänglig"}
                  </p>
                ) : isCurrent ? (
                  <p className="text-center font-mono text-[11px] text-graphite">
                    Hantera nedan
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
                    {busy === id ? "Öppnar kassan…" : `Välj ${plan.name}`}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {!billingEnabled && (
        <p className="mt-4 text-sm text-amber">
          Betalningar är inte konfigurerade på den här installationen, så
          knapparna är inaktiva. Gratisnivån fungerar som vanligt.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-redpen">
          {error}
        </p>
      )}
    </div>
  );
}
