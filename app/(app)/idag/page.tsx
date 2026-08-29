import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Odometer } from "@/components/odometer";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { withEntitlements } from "@/lib/billing/entitlements";
import { questions } from "@/lib/db/schema";
import { dailyAllowance } from "@/lib/billing/entitlements";
import { todaysDeck } from "@/lib/deck";
import { daysToTest, gatherPlanInputs } from "@/lib/plan-server";
import { computeDailyPlan } from "@/lib/plan";
import type { Key } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";
import { formatPercent } from "@/lib/i18n/format";
import { patternCategoryLabel, skillLabel, skillShortLabel } from "@/lib/i18n/labels";
import { getSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TodayPage() {
  // Mixed page: a free account lands here too, so it resolves
  // entitlements and adapts rather than redirecting.
  const { sdb, entitlements } = await withEntitlements();
  const { locale, t } = await getI18n();
  const inputs = await gatherPlanInputs(sdb);
  const plan = computeDailyPlan(inputs);
  const days = await daysToTest(sdb);
  const verifiedCount =
    (
      await sdb.q
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;
  const cadence = inputs.cadenceDays;
  const daysUntilTimed = plan.timedSetToday
    ? 0
    : cadence - (inputs.dayIndex % cadence);
  const allowance = await dailyAllowance(sdb, entitlements);
  const deck = await todaysDeck(sdb);
  const deckWaiting = deck.due + deck.fresh;
  const firstRun =
    Object.values(inputs.skillAccuracy).reduce((s, r) => s + r.total, 0) === 0;

  return (
    <div className="space-y-6">
      {!entitlements.paid && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm">
              <span className="font-medium">
                {t("dashboard.freeTierTitle")}
              </span>{" "}
              <span className="text-graphite">
                {t("dashboard.freeTierBody", { limit: allowance.limit ?? 0 })}
              </span>
            </p>
            <p className="font-mono text-[11px] text-graphite">
              {t("dashboard.freeTierUsage", {
                used: allowance.used,
                limit: allowance.limit ?? 0,
              })}{" "}
              ·{" "}
              <Link href="/konto" className="text-ballpoint underline">
                {t("dashboard.seePlans")}
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold">
            {t("dashboard.title")}
          </h1>
          {days != null ? (
            <p className="mt-1 flex items-baseline gap-2">
              <Odometer
                text={String(Math.max(0, days))}
                className="font-display text-5xl font-bold"
              />
              <span className="text-sm text-graphite">
                {t("dashboard.daysToTest")}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber">
              {t("dashboard.setTestDate")}
            </p>
          )}
        </div>
        <SettingsForm
          testDate={await getSetting(sdb, "test_date")}
          cadence={cadence}
        />
      </div>

      {firstRun && (
        <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-5 shadow-ambient">
          <h2 className="font-display text-base font-semibold">
            {t("dashboard.firstRunTitle")}
          </h2>
          <ol className="mt-2 space-y-1.5 text-sm">
            <li>
              <span className="font-mono text-xs text-ballpoint">1</span>{" "}
              <Link
                href="/learn"
                className="font-medium text-ballpoint hover:underline"
              >
                {t("dashboard.firstRunReadLink")}
              </Link>{" "}
              <span className="text-graphite">
                {t("dashboard.firstRunReadRest")}
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-ballpoint">2</span>{" "}
              <Link
                href="/drill"
                className="font-medium text-ballpoint hover:underline"
              >
                {t("dashboard.firstRunDrillLink")}
              </Link>{" "}
              <span className="text-graphite">
                {t("dashboard.firstRunDrillRest")}
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-ballpoint">3</span>{" "}
              <span className="text-graphite">
                {t("dashboard.firstRunReturn")}{" "}
                <Link
                  href="/deck"
                  className="font-medium text-ballpoint hover:underline"
                >
                  {t("dashboard.firstRunReviewLink")}
                </Link>
                {t("dashboard.firstRunReturnEnd")}
              </span>
            </li>
          </ol>
        </section>
      )}

      {plan.phase && (
        <section className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-control bg-highlight px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide">
              {t(`phase.${plan.phase}` as Key)}
            </span>
            <p className="text-sm text-graphite">
              {t(`phase.${plan.phase}Note` as Key)}
            </p>
            {plan.mock && (
              <p className={plan.mock.today ? "text-sm font-medium text-ballpoint" : "text-sm text-graphite"}>
                {plan.mock.today
                  ? t("dashboard.mockToday")
                  : t("dashboard.mockInDays", { days: plan.mock.inDays })}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlanCard
          title={t("dashboard.patternRoundsTitle")}
          body={
            <span>
              {t("dashboard.patternRoundsBody")}
              <br />
              {plan.patternRounds
                .map((k) => patternCategoryLabel(t, k))
                .join(" · ")}
            </span>
          }
        >
          <div className="flex flex-col gap-1.5">
            {plan.patternRounds.map((key, i) => (
              <Link
                key={key}
                href={`/patterns?start=${key}`}
                className="text-sm font-medium text-ballpoint hover:underline"
              >
                {t("dashboard.startRound", {
                  n: i + 1,
                  category: patternCategoryLabel(t, key),
                })}
              </Link>
            ))}
          </div>
        </PlanCard>

        <PlanCard
          title={t("dashboard.weightedDrillTitle", {
            count: plan.drill.total,
          })}
          body={
            <span>
              {plan.drill.bySkill
                .filter((s) => s.count > 0)
                .map((s) => `${skillShortLabel(t, s.skill)} ${s.count}`)
                .join(" · ")}
            </span>
          }
        >
          {verifiedCount > 0 ? (
            <Link
              href="/drill?plan=1"
              className="text-sm font-medium text-ballpoint hover:underline"
            >
              {t("dashboard.startTodaysDrill", { count: plan.drill.total })}
            </Link>
          ) : (
            <span className="text-sm text-graphite">
              {t("dashboard.bankEmpty")}
            </span>
          )}
        </PlanCard>

        <PlanCard
          title={t("dashboard.reviewTitle")}
          body={
            <span>
              {plan.dueRedoCount > 0
                ? t("dashboard.redosDue", { count: plan.dueRedoCount })
                : t("dashboard.noRedosDue")}
              {" · "}
              {deckWaiting > 0
                ? t("dashboard.deckWaiting", { count: deckWaiting })
                : t("dashboard.deckClear")}
            </span>
          }
        >
          <div className="flex flex-col gap-1.5">
            {deckWaiting > 0 && (
              <Link
                href="/deck"
                className="text-sm font-medium text-ballpoint hover:underline"
              >
                {t("dashboard.flipDeck", { count: deckWaiting })}
              </Link>
            )}
            {plan.dueRedoCount > 0 ? (
              <Link
                href="/queue?start=1"
                className="text-sm font-medium text-ballpoint hover:underline"
              >
                {t("dashboard.redoAllDue", { count: plan.dueRedoCount })}
              </Link>
            ) : (
              <Link
                href="/queue"
                className="text-sm text-graphite hover:underline"
              >
                {t("dashboard.openQueue")}
              </Link>
            )}
          </div>
        </PlanCard>

        <PlanCard
          title={t("dashboard.timedSetTitle")}
          body={
            plan.timedSetToday ? (
              <span>{t("dashboard.timedToday")}</span>
            ) : (
              <span>
                {t("dashboard.timedNext", {
                  days: daysUntilTimed,
                  cadence,
                })}
              </span>
            )
          }
        >
          {plan.timedSetToday ? (
            <Link
              href="/timed?start=full"
              className="text-sm font-medium text-ballpoint hover:underline"
            >
              {t("dashboard.startFullSection")}
            </Link>
          ) : (
            <Link href="/timed" className="text-sm text-graphite hover:underline">
              {t("dashboard.timedSetsLink")}
            </Link>
          )}
        </PlanCard>
      </div>

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <h2 className="font-display text-sm font-semibold">
          {t("dashboard.weightsTitle")}
        </h2>
        <p className="mt-0.5 text-xs text-graphite">
          {t("dashboard.weightsLede")}
        </p>
        <div className="mt-3 space-y-2">
          {plan.drill.bySkill.map(({ skill }) => {
            const weight = plan.weights[skill];
            const record = inputs.skillAccuracy[skill];
            return (
              <div key={skill} className="flex items-center gap-3 text-sm">
                <span className="w-64 shrink-0">{skillLabel(t, skill)}</span>
                <div className="h-2 flex-1 rounded-full bg-grid">
                  <div
                    className={cn("h-2 rounded-full bg-ballpoint")}
                    style={{ width: `${Math.round(weight * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs">
                  {formatPercent(weight, locale)}
                </span>
                <span className="w-24 text-right font-mono text-xs text-graphite">
                  {record.total > 0
                    ? t("dashboard.recentRecord", {
                        correct: record.correct,
                        total: record.total,
                      })
                    : t("dashboard.noData")}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  title,
  body,
  children,
}: {
  title: string;
  body: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      <p className="mt-1 flex-1 text-xs text-graphite">{body}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
