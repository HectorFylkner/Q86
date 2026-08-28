import Link from "next/link";
import { PlanCards } from "@/components/billing/plan-cards";
import { PortalButton } from "@/components/billing/portal-button";
import {
  dailyAllowance,
  withEntitlements,
} from "@/lib/billing/entitlements";
import { FEATURES, PLANS, type Feature } from "@/lib/billing/pricing";
import { stripeConfigured, stripeIsLive } from "@/lib/billing/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = { title: "Konto – Q86" };

/** What each gated feature is called when the paywall names it. */
const FEATURE_LABELS: Record<Feature, string> = {
  learn: "kapitlen",
  drill: "träningen",
  patterns: "mönsterträningen",
  diagnostic: "diagnosen",
  timed: "tidsatta set och sektionssimulering",
  queue: "repetitionskön",
  deck: "minneskorten",
  analytics: "analysen",
  mastery: "mästerskapsstegarna",
  decide: "beslutsövningarna",
  plan: "dagsplanen",
  coach: "whiteboard-genomgången",
  import: "import av score report",
};

const STATUS_LABELS: Record<string, string> = {
  none: "Ingen prenumeration",
  trialing: "Provperiod",
  active: "Aktiv",
  past_due: "Betalning misslyckades",
  canceled: "Uppsagd",
  incomplete: "Ofullständig",
  unpaid: "Obetald",
  expired: "Avslutad",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ las?: string; betalning?: string }>;
}) {
  const { user, sdb, entitlements } = await withEntitlements();
  const { las, betalning } = await searchParams;
  const allowance = await dailyAllowance(sdb, entitlements);

  const blocked =
    las && (FEATURES as readonly string[]).includes(las)
      ? (las as Feature)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Konto</h1>
        <p className="mt-1 font-mono text-xs text-graphite">{user.email}</p>
      </div>

      {betalning === "klar" && (
        <p
          role="status"
          className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-4 text-sm"
        >
          Tack — betalningen är registrerad. Om planen nedan inte har
          uppdaterats ännu tar Stripe några sekunder på sig; ladda om sidan.
        </p>
      )}
      {betalning === "avbruten" && (
        <p role="status" className="text-sm text-graphite">
          Kassan avbröts. Inget har debiterats.
        </p>
      )}

      {blocked && (
        <div className="rounded-card border border-amber/50 bg-amber/5 p-4">
          <h2 className="font-display text-sm font-semibold">
            {FEATURE_LABELS[blocked].charAt(0).toUpperCase() +
              FEATURE_LABELS[blocked].slice(1)} ingår inte i din plan
          </h2>
          <p className="mt-1 text-sm text-graphite">
            Gratisnivån innehåller kapitlen, mönsterträningen och{" "}
            {PLANS.free.dailyQuestionLimit} frågor per dag. Resten öppnas med
            Månad eller GMAT-sprint.
          </p>
        </div>
      )}

      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              {PLANS[entitlements.plan].name}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-graphite">
              {STATUS_LABELS[entitlements.status] ?? entitlements.status}
              {entitlements.currentPeriodEnd && (
                <>
                  {" · "}
                  {entitlements.cancelAtPeriodEnd
                    ? "avslutas"
                    : entitlements.plan === "sprint"
                      ? "gäller till"
                      : "förnyas"}{" "}
                  {formatDate(entitlements.currentPeriodEnd)}
                </>
              )}
            </p>
          </div>
          {allowance.limit != null && (
            <p className="font-mono text-[11px] text-graphite">
              {allowance.used} / {allowance.limit} frågor i dag
            </p>
          )}
        </div>

        {entitlements.needsAttention && (
          <p role="alert" className="mt-3 text-sm text-redpen">
            Stripe kunde inte dra betalningen. Uppdatera kortet nedan innan
            perioden går ut, så behåller du tillgången.
          </p>
        )}

        {entitlements.plan !== "free" && (
          <div className="mt-4">
            <PortalButton />
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-base font-semibold">Planer</h2>
        <p className="mt-1 text-sm text-graphite">
          Alla priser i svenska kronor, inklusive moms. Uppsägning när som
          helst, direkt i betalportalen.
        </p>
        <div className="mt-4">
          <PlanCards
            currentPlan={entitlements.plan}
            billingEnabled={stripeConfigured()}
            highlight={blocked ? "monthly" : "sprint"}
          />
        </div>
        {stripeConfigured() && !stripeIsLive() && (
          <p className="mt-4 font-mono text-[11px] text-amber">
            Testläge: inga riktiga betalningar går igenom. Använd Stripes
            testkort 4242 4242 4242 4242.
          </p>
        )}
      </section>

      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <h2 className="font-display text-sm font-semibold">Dina uppgifter</h2>
        <p className="mt-1 text-sm text-graphite">
          Du kan när som helst ladda ner allt Q86 sparar om dig, som en
          JSON-fil.
        </p>
        <div className="mt-3">
          <Link
            href="/api/export"
            download
            className="rounded-control border border-grid px-4 py-2 text-sm transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
          >
            Ladda ner mina uppgifter ↓
          </Link>
        </div>
      </section>
    </div>
  );
}
