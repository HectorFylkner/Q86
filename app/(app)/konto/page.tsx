import Link from "next/link";
import { PlanCards } from "@/components/billing/plan-cards";
import { PortalButton } from "@/components/billing/portal-button";
import { dailyAllowance, withEntitlements } from "@/lib/billing/entitlements";
import { FEATURES, PLANS, type Feature } from "@/lib/billing/pricing";
import { stripeConfigured, stripeIsLive } from "@/lib/billing/stripe";
import type { Key } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import {
  ProgressCardPanel,
  ReferralPanel,
} from "@/components/retention/share-controls";
import { REFERRAL_DAYS, referralCount } from "@/lib/retention/grants";
import { currentShareCode } from "@/lib/retention/share";
import { SITE_ORIGIN } from "@/lib/site";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatDate } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: `${t("account.title")} – Q86` };
}

/** Capitalises the first letter of a Swedish or English noun phrase. */
function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ las?: string; betalning?: string }>;
}) {
  const { user, sdb, entitlements } = await withEntitlements();
  const { locale, t } = await getI18n();
  const { las, betalning } = await searchParams;
  const allowance = await dailyAllowance(sdb, entitlements);

  // Read, never mint: an account that has not asked for a referral or a
  // share code does not get one just by opening this page.
  const codes = await sdb.q
    .select({ referral: users.referralCode })
    .from(users)
    .where(eq(users.id, user.id))
    .get();
  const referralCode = codes?.referral ?? null;
  const shareCode = await currentShareCode(user.id);
  const referrals = await referralCount(user.id);

  const blocked =
    las && (FEATURES as readonly string[]).includes(las)
      ? (las as Feature)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">
          {t("account.title")}
        </h1>
        <p className="mt-1 font-mono text-xs text-graphite">{user.email}</p>
      </div>

      {betalning === "klar" && (
        <p
          role="status"
          className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-4 text-sm"
        >
          {t("account.paymentDone")}
        </p>
      )}
      {betalning === "avbruten" && (
        <p role="status" className="text-sm text-graphite">
          {t("account.paymentCancelled")}
        </p>
      )}

      {blocked && (
        <div className="rounded-card border border-amber/50 bg-amber/5 p-4">
          <h2 className="font-display text-sm font-semibold">
            {t("account.lockedTitle", {
              feature: sentenceCase(t(`account.feature.${blocked}` as Key)),
            })}
          </h2>
          <p className="mt-1 text-sm text-graphite">
            {t("account.lockedBody", {
              limit: PLANS.free.dailyQuestionLimit ?? 0,
            })}
          </p>
        </div>
      )}

      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              {t(`billing.plans.${entitlements.plan}.name` as Key)}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-graphite">
              {t(`account.status.${entitlements.status}` as Key)}
              {entitlements.currentPeriodEnd && (
                <>
                  {" · "}
                  {entitlements.cancelAtPeriodEnd
                    ? t("account.endsOn")
                    : entitlements.plan === "sprint"
                      ? t("account.validUntil")
                      : t("account.renews")}{" "}
                  {formatDate(entitlements.currentPeriodEnd, locale)}
                </>
              )}
            </p>
          </div>
          {allowance.limit != null && (
            <p className="font-mono text-[11px] text-graphite">
              {t("account.usedToday", {
                used: allowance.used,
                limit: allowance.limit,
              })}
            </p>
          )}
        </div>

        {entitlements.needsAttention && (
          <p role="alert" className="mt-3 text-sm text-redpen">
            {t("account.paymentProblem")}
          </p>
        )}

        {entitlements.plan !== "free" && (
          <div className="mt-4">
            <PortalButton />
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-base font-semibold">
          {t("billing.plansHeading")}
        </h2>
        <p className="mt-1 text-sm text-graphite">{t("billing.plansLede")}</p>
        <div className="mt-4">
          <PlanCards
            currentPlan={entitlements.plan}
            billingEnabled={stripeConfigured()}
            highlight={blocked ? "monthly" : "sprint"}
          />
        </div>
        {stripeConfigured() && !stripeIsLive() && (
          <p className="mt-4 font-mono text-[11px] text-amber">
            {t("billing.testMode")}
          </p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferralPanel
          initialCode={referralCode}
          count={referrals}
          days={REFERRAL_DAYS}
          origin={SITE_ORIGIN}
        />
        <ProgressCardPanel initialCode={shareCode} origin={SITE_ORIGIN} />
      </div>

      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <h2 className="font-display text-sm font-semibold">
          {t("account.dataTitle")}
        </h2>
        <p className="mt-1 text-sm text-graphite">{t("account.dataLede")}</p>
        <div className="mt-3">
          <Link
            href="/api/export"
            download
            className="rounded-control border border-grid px-4 py-2 text-sm transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
          >
            {t("account.dataDownload")}
          </Link>
        </div>
      </section>
    </div>
  );
}
