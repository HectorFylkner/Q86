import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Odometer } from "@/components/odometer";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { todaysDeck } from "@/lib/deck";
import { PATTERN_CATEGORY_LABELS } from "@/lib/generators";
import { daysToTest, gatherPlanInputs } from "@/lib/plan-server";
import { computeDailyPlan, PHASE_LABELS, PHASE_NOTES } from "@/lib/plan";
import { getSetting } from "@/lib/settings";
import { SKILL_SHORT_LABELS, SKILL_LABELS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function TodayPage() {
  const inputs = await gatherPlanInputs();
  const plan = computeDailyPlan(inputs);
  const days = await daysToTest();
  const verifiedCount =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;
  const cadence = inputs.cadenceDays;
  const daysUntilTimed = plan.timedSetToday
    ? 0
    : cadence - (inputs.dayIndex % cadence);
  const deck = await todaysDeck();
  const deckWaiting = deck.due + deck.fresh;
  const firstRun =
    Object.values(inputs.skillAccuracy).reduce((s, r) => s + r.total, 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold">Today</h1>
          {days != null ? (
            <p className="mt-1 flex items-baseline gap-2">
              <Odometer
                text={String(Math.max(0, days))}
                className="font-display text-5xl font-bold"
              />
              <span className="text-sm text-graphite">
                days to the test
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber">
              Set your test date so the plan can pace itself.
            </p>
          )}
        </div>
        <SettingsForm testDate={await getSetting("test_date")} cadence={cadence} />
      </div>

      {firstRun && (
        <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-5 shadow-ambient">
          <h2 className="font-display text-base font-semibold">
            New here? The loop is simple.
          </h2>
          <ol className="mt-2 space-y-1.5 text-sm">
            <li>
              <span className="font-mono text-xs text-ballpoint">1</span>{" "}
              <Link
                href="/learn"
                className="font-medium text-ballpoint hover:underline"
              >
                Read a chapter
              </Link>{" "}
              <span className="text-graphite">
                on a topic you want to sharpen — each one ends with a
                checklist.
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-ballpoint">2</span>{" "}
              <Link
                href="/drill"
                className="font-medium text-ballpoint hover:underline"
              >
                Drill it immediately
              </Link>{" "}
              <span className="text-graphite">
                — every miss is dissected: fastest path, trap anatomy,
                takeaway.
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-ballpoint">3</span>{" "}
              <span className="text-graphite">
                Come back tomorrow: your misses return as flashcards and
                spaced redos in{" "}
                <Link
                  href="/deck"
                  className="font-medium text-ballpoint hover:underline"
                >
                  Review
                </Link>
                , and this page starts planning your days.
              </span>
            </li>
          </ol>
        </section>
      )}

      {plan.phase && (
        <section className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-control bg-highlight px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide">
              {PHASE_LABELS[plan.phase]}
            </span>
            <p className="text-sm text-graphite">{PHASE_NOTES[plan.phase]}</p>
            {plan.mock && (
              <p className={plan.mock.today ? "text-sm font-medium text-ballpoint" : "text-sm text-graphite"}>
                {plan.mock.today
                  ? "Official mock today — take it, then import the score report."
                  : `Next official mock in ${plan.mock.inDays} day${plan.mock.inDays === 1 ? "" : "s"}.`}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlanCard
          title="Pattern rounds"
          body={
            <span>
              Two lowest-ELO categories:
              <br />
              {plan.patternRounds
                .map((k) => PATTERN_CATEGORY_LABELS[k])
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
                Start round {i + 1}: {PATTERN_CATEGORY_LABELS[key]} →
              </Link>
            ))}
          </div>
        </PlanCard>

        <PlanCard
          title={`Weighted drill · ${plan.drill.total} questions`}
          body={
            <span>
              {plan.drill.bySkill
                .filter((s) => s.count > 0)
                .map((s) => `${SKILL_SHORT_LABELS[s.skill]} ${s.count}`)
                .join(" · ")}
            </span>
          }
        >
          {verifiedCount > 0 ? (
            <Link
              href="/drill?plan=1"
              className="text-sm font-medium text-ballpoint hover:underline"
            >
              Start today&apos;s drill: {plan.drill.total} questions →
            </Link>
          ) : (
            <span className="text-sm text-graphite">
              The bank is empty — run pnpm seed first.
            </span>
          )}
        </PlanCard>

        <PlanCard
          title="Review"
          body={
            <span>
              {plan.dueRedoCount > 0
                ? `${plan.dueRedoCount} redo${plan.dueRedoCount === 1 ? "" : "s"} due`
                : "No redos due"}
              {" · "}
              {deckWaiting > 0
                ? `${deckWaiting} deck card${deckWaiting === 1 ? "" : "s"} waiting`
                : "deck clear"}
            </span>
          }
        >
          <div className="flex flex-col gap-1.5">
            {deckWaiting > 0 && (
              <Link
                href="/deck"
                className="text-sm font-medium text-ballpoint hover:underline"
              >
                Flip the deck: {deckWaiting} card{deckWaiting === 1 ? "" : "s"} →
              </Link>
            )}
            {plan.dueRedoCount > 0 ? (
              <Link
                href="/queue?start=1"
                className="text-sm font-medium text-ballpoint hover:underline"
              >
                Redo all {plan.dueRedoCount} due →
              </Link>
            ) : (
              <Link
                href="/queue"
                className="text-sm text-graphite hover:underline"
              >
                Open the queue →
              </Link>
            )}
          </div>
        </PlanCard>

        <PlanCard
          title="Timed set"
          body={
            plan.timedSetToday ? (
              <span>Scheduled today: full 21-question section.</span>
            ) : (
              <span>
                Next scheduled in {daysUntilTimed}{" "}
                {daysUntilTimed === 1 ? "day" : "days"} (every {cadence}).
              </span>
            )
          }
        >
          {plan.timedSetToday ? (
            <Link
              href="/timed?start=full"
              className="text-sm font-medium text-ballpoint hover:underline"
            >
              Start 21-question section →
            </Link>
          ) : (
            <Link href="/timed" className="text-sm text-graphite hover:underline">
              Timed sets →
            </Link>
          )}
        </PlanCard>
      </div>

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <h2 className="font-display text-sm font-semibold">
          Skill weights driving today&apos;s mix
        </h2>
        <p className="mt-0.5 text-xs text-graphite">
          Rolling last-30-attempt accuracy blended 50/50 with the imported
          baseline; 5% floor keeps every skill in rotation.
        </p>
        <div className="mt-3 space-y-2">
          {plan.drill.bySkill.map(({ skill }) => {
            const weight = plan.weights[skill];
            const record = inputs.skillAccuracy[skill];
            return (
              <div key={skill} className="flex items-center gap-3 text-sm">
                <span className="w-64 shrink-0">{SKILL_LABELS[skill]}</span>
                <div className="h-2 flex-1 rounded-full bg-grid">
                  <div
                    className={cn("h-2 rounded-full bg-ballpoint")}
                    style={{ width: `${Math.round(weight * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs">
                  {Math.round(weight * 100)}%
                </span>
                <span className="w-24 text-right font-mono text-xs text-graphite">
                  {record.total > 0
                    ? `${record.correct}/${record.total} recent`
                    : "no data"}
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
