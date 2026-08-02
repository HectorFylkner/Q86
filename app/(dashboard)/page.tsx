import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { count, eq } from "drizzle-orm";
import { Odometer } from "@/components/odometer";
import { PlanEvidence } from "@/components/dashboard/plan-evidence";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { todaysDeck } from "@/lib/deck";
import { PATTERN_CATEGORY_LABELS } from "@/lib/generators";
import { daysToTest, gatherPlanInputs, selectPlanDrillIds } from "@/lib/plan-server";
import {
  DIAGNOSTIC_PER_SKILL,
  DIAGNOSTIC_SIZE,
  latestDiagnostic,
} from "@/lib/diagnostic";
import { computeDailyPlan, PHASE_LABELS, PHASE_NOTES } from "@/lib/plan";
import { findResumable, todaysQueueThenDrill } from "@/lib/resume";
import { baselineWeakness, getSetting } from "@/lib/settings";
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
  const resumable = await findResumable();
  const planDrillIds = verifiedCount > 0 ? await selectPlanDrillIds(plan) : [];
  const today = await todaysQueueThenDrill(planDrillIds);
  const deckWaiting = deck.due + deck.fresh;
  const baselineSource: "report" | "diagnostic" | null =
    (await getSetting("test_date")) !== undefined && inputs.baselineWeakness
      ? (await baselineWeakness())
        ? "report"
        : (await latestDiagnostic())
          ? "diagnostic"
          : null
      : null;
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
          {/* Placement first. Until something measures where you stand,
              the weighted plan below is uniform across all four skills,
              which is the one weighting guaranteed to be wrong. Sixteen
              questions is the cheapest way to stop guessing. */}
          <h2 className="font-display text-base font-semibold">
            Start with a placement diagnostic
          </h2>
          <p className="mt-1 max-w-[62ch] text-sm text-graphite">
            {DIAGNOSTIC_SIZE} questions, {DIAGNOSTIC_PER_SKILL} from each
            fundamental skill, mixed together the way the exam mixes them.
            It takes about half an hour and it is what today&apos;s plan
            weights against until you import a real score report.
          </p>
          <Link
            href="/drill?diagnostic=1"
            className="mt-3 inline-flex min-h-[44px] items-center rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
          >
            Take the diagnostic →
          </Link>
          <h3 className="mt-5 font-display text-sm font-semibold">
            Or start reading — the loop is simple.
          </h3>
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

      {resumable && (
        <section className="rounded-card border border-amber/50 bg-amber/5 px-4 py-3 shadow-ambient">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-title font-semibold">
                Pick up where you stopped
              </h2>
              <p className="mt-0.5 text-caption text-graphite">
                A {resumable.mode === "redo" ? "redo run" : "drill"} from{" "}
                {formatDistanceToNow(resumable.startedAt, { addSuffix: true })}{" "}
                ended without finishing — {resumable.answered} answered,{" "}
                {resumable.remainingCount} left. The answered ones are already
                saved; this resumes rather than restarts.
              </p>
            </div>
            <Link
              href={`/drill?qids=${resumable.remainingIds.join(",")}`}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-control bg-amber px-4 py-2 text-body font-medium text-paper transition-opacity hover:opacity-90"
            >
              Resume {resumable.remainingCount} question
              {resumable.remainingCount === 1 ? "" : "s"} →
            </Link>
          </div>
        </section>
      )}

      {today.ids.length > 0 && (
        <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 px-4 py-4 shadow-ambient">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-title font-semibold">
                Start today
              </h2>
              <p className="mt-0.5 max-w-[62ch] text-caption text-graphite">
                Everything the plan says today is, in order and in one run:{" "}
                {today.dueIds.length > 0 && (
                  <>
                    <span className="font-medium text-ink">
                      {today.dueIds.length} redo
                      {today.dueIds.length === 1 ? "" : "s"} due
                    </span>{" "}
                    first, then{" "}
                  </>
                )}
                <span className="font-medium text-ink">
                  {today.ids.length - today.dueIds.length} weighted drill
                  question
                  {today.ids.length - today.dueIds.length === 1 ? "" : "s"}
                </span>
                . No returning to this page between blocks.
              </p>
            </div>
            <Link
              href={`/drill?qids=${today.ids.join(",")}`}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-control bg-ballpoint px-5 py-2.5 text-body font-medium text-white transition-opacity hover:opacity-90"
            >
              Start today · {today.ids.length} questions →
            </Link>
          </div>
        </section>
      )}

      {plan.phase && (
        <section className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="rounded-control bg-highlight px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide">
              {PHASE_LABELS[plan.phase]}
            </span>
            <p className="text-sm text-graphite">{PHASE_NOTES[plan.phase]}</p>
            {/* What the weighting is actually based on. A plan that
                cannot say where its weights came from is asking to be
                trusted on nothing. */}
            <p className="font-mono text-[11px] text-graphite">
              weighted against{" "}
              {baselineSource === "report"
                ? "your imported score report"
                : baselineSource === "diagnostic"
                  ? "your placement diagnostic"
                  : "nothing yet — all four skills equal"}
            </p>
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
                className="inline-flex min-h-[44px] items-center text-body font-medium text-ballpoint hover:underline"
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
              className="inline-flex min-h-[44px] items-center text-body font-medium text-ballpoint hover:underline"
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
                className="inline-flex min-h-[44px] items-center text-body font-medium text-ballpoint hover:underline"
              >
                Flip the deck: {deckWaiting} card{deckWaiting === 1 ? "" : "s"} →
              </Link>
            )}
            {plan.dueRedoCount > 0 ? (
              <Link
                href="/queue?start=1"
                className="inline-flex min-h-[44px] items-center text-body font-medium text-ballpoint hover:underline"
              >
                Redo all {plan.dueRedoCount} due →
              </Link>
            ) : (
              <Link
                href="/queue"
                className="inline-flex min-h-[44px] items-center text-body text-graphite hover:underline"
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
              className="inline-flex min-h-[44px] items-center text-body font-medium text-ballpoint hover:underline"
            >
              Start 21-question section →
            </Link>
          ) : (
            <Link href="/timed" className="inline-flex min-h-[44px] items-center text-body text-graphite hover:underline">
              Timed sets →
            </Link>
          )}
        </PlanCard>
      </div>

      <PlanEvidence
        plan={plan}
        skillAccuracy={inputs.skillAccuracy}
        baselineWeakness={inputs.baselineWeakness}
        weightOverrides={inputs.weightOverrides}
        daysToTest={days}
      />
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
