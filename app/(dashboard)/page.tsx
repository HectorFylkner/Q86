import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { format } from "date-fns";
import { Odometer } from "@/components/odometer";
import { ClearedStamp } from "@/components/dashboard/cleared-stamp";
import { PlanSettings } from "@/components/dashboard/plan-settings";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { todaysDeck } from "@/lib/deck";
import {
  PATTERN_CATEGORY_LABELS,
} from "@/lib/generators";
import {
  daysToTest,
  gatherPlanInputs,
  gatherTodayProgress,
  type TodayProgress,
} from "@/lib/plan-server";
import {
  computeDailyPlan,
  phaseOf,
  PHASE_LABELS,
  PHASE_NOTES,
  type DailyPlan,
} from "@/lib/plan";
import { getSetting } from "@/lib/settings";
import { SKILL_SHORT_LABELS, SKILL_LABELS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// The day as an agenda. computeDailyPlan stays the sole scheduler — this
// file only reshapes its output (plus today's completed work) into one
// leading action and a checklist. Priority order is the plan's own:
// mock > timed set > due redos > drill; the takeaway deck and pattern
// rounds close out the day.
// ---------------------------------------------------------------------------

type AgendaStatus = "todo" | "done" | "unavailable";

type AgendaItem = {
  key: string;
  status: AgendaStatus;
  title: string;
  meta: string;
  /** Row link while the item is open. */
  action: { label: string; href: string } | null;
  /** Right-column result (done) or reason (unavailable). */
  note: string | null;
  /** How the item presents when it leads the day. */
  hero: {
    tone: "ink" | "amber";
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    href: string;
  };
};

type DeckSnapshot = Awaited<ReturnType<typeof todaysDeck>>;

/** Days until the next scheduled timed section, projected with the
 *  plan's own rule per future day (phaseOf + the speed/peak cadence
 *  clamps), so the countdown stays correct across phase boundaries. */
function nextTimedIn(
  days: number | null,
  dayIndex: number,
  cadence: number,
): number {
  for (let k = 1; k <= 60; k++) {
    const phase = phaseOf(days == null ? null : days - k);
    const effective =
      phase === "speed"
        ? Math.min(cadence, 2)
        : phase === "peak"
          ? Math.max(cadence, 3)
          : cadence;
    if (effective > 0 && (dayIndex + k) % effective === 0) return k;
  }
  return cadence;
}

function buildAgenda({
  plan,
  deck,
  progress,
  verifiedCount,
  timedPoolCount,
}: {
  plan: DailyPlan;
  deck: DeckSnapshot;
  progress: TodayProgress;
  verifiedCount: number;
  /** Verified problem-solving questions — sections never use DS. */
  timedPoolCount: number;
}): AgendaItem[] {
  const items: AgendaItem[] = [];

  if (plan.mock?.today) {
    const done = progress.reportImported;
    items.push({
      key: "mock",
      status: done ? "done" : "todo",
      title: "Official mock",
      meta: done
        ? "Score report imported — the plan re-baselines from here."
        : "Full official practice exam — import the score report after.",
      action: done ? null : { label: "Open import", href: "/import" },
      note: done ? "report imported" : null,
      hero: {
        tone: "amber",
        eyebrow: "Mock day",
        title: "Sit the official mock",
        body: "Test conditions, cold start, no pausing. Import the score report afterwards and the whole plan re-baselines around it.",
        cta: "Import the score report",
        href: "/import",
      },
    });
  }

  if (plan.timedSetToday) {
    const t = progress.timed;
    // Only the full section completes the scheduled item; a mini is
    // acknowledged but leaves the day's section on the plan.
    const fullDone = t?.kind === "full";
    const bankReady = timedPoolCount >= 21;
    const status: AgendaStatus = fullDone
      ? "done"
      : bankReady
        ? "todo"
        : "unavailable";
    items.push({
      key: "timed",
      status,
      title: "Timed section",
      meta:
        status === "unavailable"
          ? "Needs at least 21 verified problem-solving questions in the bank."
          : t?.kind === "mini"
            ? "A mini set is in the book — the full 21-question section is still on the plan."
            : "Full 21-question section: exam pacing, 3-edit budget.",
      action:
        status === "todo"
          ? { label: "Start the section", href: "/timed?start=full" }
          : null,
      note:
        status === "done"
          ? t!.correct != null && t!.total != null
            ? `${t!.correct}/${t!.total}`
            : "done"
          : status === "unavailable"
            ? "bank too small"
            : null,
      hero: {
        tone: "ink",
        eyebrow: "Up next",
        title: "21-question timed section",
        body: "The same length and pacing as the real section, with the live edit budget. Decisions beat perfection — bank the easy ones fast.",
        cta: "Start the section",
        href: "/timed?start=full",
      },
    });
  }

  if (plan.dueRedoCount > 0 || progress.redosDone > 0) {
    const n = plan.dueRedoCount;
    const done = n === 0;
    items.push({
      key: "redo",
      status: done ? "done" : "todo",
      title: "Redo queue",
      meta: done
        ? "Everything that was due today is handled."
        : `${n} due${progress.redosDone > 0 ? ` · ${progress.redosDone} redone so far` : ""} — a correct redo climbs the ladder, a miss resets it.`,
      action: done ? null : { label: `Redo all ${n}`, href: "/queue?start=1" },
      note: done ? `${progress.redosDone} redone` : null,
      hero: {
        tone: "ink",
        eyebrow: "Up next",
        title: `Clear ${n} due redo${n === 1 ? "" : "s"}`,
        body: "Old misses coming back on schedule. Correct climbs the ladder — stage 2 inside 2:30 retires the question for good; a miss starts it over.",
        cta: `Redo all ${n}`,
        href: "/queue?start=1",
      },
    });
  }

  {
    const total = plan.drill.total;
    const done = progress.drillDone;
    const mix = plan.drill.bySkill
      .filter((s) => s.count > 0)
      .map((s) => `${SKILL_SHORT_LABELS[s.skill]} ${s.count}`)
      .join(" · ");
    const status: AgendaStatus =
      verifiedCount === 0 ? "unavailable" : done >= total ? "done" : "todo";
    const pct =
      done > 0 ? Math.round((progress.drillCorrect / done) * 100) : 0;
    items.push({
      key: "drill",
      status,
      title: `Weighted drill · ${total} questions`,
      meta:
        status === "unavailable"
          ? "The bank is empty — seed it to unlock drills and timed sets."
          : mix,
      action:
        status === "todo"
          ? {
              label:
                done > 0
                  ? `Keep going · ${done}/${total}`
                  : `Start ${total} questions`,
              href: "/drill?plan=1",
            }
          : null,
      note:
        status === "done"
          ? `${done} done · ${pct}%`
          : status === "unavailable"
            ? "run pnpm seed"
            : null,
      hero: {
        tone: "ink",
        eyebrow: "Up next",
        title:
          done > 0
            ? `Finish the drill — ${total - done} to go`
            : `Drill ${total} weighted questions`,
        body:
          done > 0
            ? `${done} of ${total} logged today at ${pct}% correct — close it out. Every miss is dissected and feeds the deck and the redo queue.`
            : `Today's mix leans on your weakest skills: ${mix}. Every miss is dissected and feeds the deck and the redo queue.`,
        cta: done > 0 ? "Keep drilling" : "Start the drill",
        href: "/drill?plan=1",
      },
    });
  }

  if (deck.cards.length > 0 || progress.deckFlipped > 0) {
    const n = deck.cards.length;
    const dueCount = deck.cards.filter((c) => c.state === "due").length;
    const newCount = n - dueCount;
    const done = n === 0;
    items.push({
      key: "deck",
      status: done ? "done" : "todo",
      title: "Takeaway deck",
      meta: done
        ? "Today's stack is graded — the schedule takes it from here."
        : `${dueCount} due · ${newCount} new miss${newCount === 1 ? "" : "es"} — trigger cue front, takeaway back.`,
      action: done
        ? null
        : { label: `Flip ${n} card${n === 1 ? "" : "s"}`, href: "/deck" },
      note: done ? `${progress.deckFlipped} graded` : null,
      hero: {
        tone: "ink",
        eyebrow: "Up next",
        title: `Flip ${n} takeaway card${n === 1 ? "" : "s"}`,
        body: "Each card fronts a trigger cue — when to reach for the method — and backs the takeaway. Grade honestly; cards you know stretch out on their own.",
        cta: "Open the deck",
        href: "/deck",
      },
    });
  }

  {
    // ELO ratings move as rounds are played, so the two "lowest" categories
    // can reshuffle mid-day; count round sessions played rather than
    // chasing keys. Only a round's own category marks a key played — a
    // stray rep inside a mixed round is not a round on that category.
    const played = new Set(progress.patternRoundCategories);
    const roundsDone = Math.min(2, progress.patternRounds);
    const done = roundsDone >= 2;
    const nextKey =
      plan.patternRounds.find((k) => !played.has(k)) ?? plan.patternRounds[0];
    const labels = plan.patternRounds.map((k) => PATTERN_CATEGORY_LABELS[k]);
    items.push({
      key: "patterns",
      status: done ? "done" : "todo",
      title: "Pattern rounds",
      meta: done
        ? "Both rounds are in — ratings updated."
        : `Two lowest-rated: ${labels.join(" · ")}${roundsDone === 1 ? " — 1 of 2 done" : ""}`,
      action: done
        ? null
        : {
            label: `Start: ${PATTERN_CATEGORY_LABELS[nextKey]}`,
            href: `/patterns?start=${nextKey}`,
          },
      note: done ? `${roundsDone} rounds` : null,
      hero: {
        tone: "ink",
        eyebrow: "Up next",
        title: `Pattern round: ${PATTERN_CATEGORY_LABELS[nextKey]}`,
        body:
          roundsDone === 1
            ? "Second round of the day — snap recall under the clock. Speed first; the rating follows."
            : `Two rounds today on your lowest-rated categories: ${labels.join(" · ")}. Snap recall under the clock — speed first, the rating follows.`,
        cta: "Start the round",
        href: `/patterns?start=${nextKey}`,
      },
    });
  }

  return items;
}

export default async function TodayPage() {
  const inputs = await gatherPlanInputs();
  const plan = computeDailyPlan(inputs);
  const days = await daysToTest();
  const deck = await todaysDeck();
  const progress = await gatherTodayProgress();
  const testDate = await getSetting("test_date");
  const verifiedCount =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(eq(questions.verified, true))
        .get()
    )?.n ?? 0;
  // Sections draw problem solving only (DS trains in drills), so the
  // timed gate counts the same pool selectTimedSet actually uses.
  const timedPoolCount =
    (
      await db
        .select({ n: count() })
        .from(questions)
        .where(
          and(
            eq(questions.verified, true),
            eq(questions.format, "problem_solving"),
          ),
        )
        .get()
    )?.n ?? 0;

  const cadence = inputs.cadenceDays;
  const daysUntilTimed = plan.timedSetToday
    ? 0
    : nextTimedIn(inputs.daysToTest, inputs.dayIndex, cadence);

  const firstRun =
    Object.values(inputs.skillAccuracy).reduce((s, r) => s + r.total, 0) === 0;

  const agenda = buildAgenda({
    plan,
    deck,
    progress,
    verifiedCount,
    timedPoolCount,
  });
  const next = agenda.find((i) => i.status === "todo") ?? null;
  const countable = agenda.filter((i) => i.status !== "unavailable");
  const doneCount = countable.filter((i) => i.status === "done").length;
  const remainingAfterNext =
    agenda.filter((i) => i.status === "todo").length - 1;
  // "Day cleared" is earned, never defaulted into: everything done and
  // nothing sitting unavailable (an empty bank is not a finished day).
  const dayCleared =
    next === null &&
    doneCount > 0 &&
    agenda.every((i) => i.status !== "unavailable");

  const comingUp: string[] = [];
  if (!plan.timedSetToday) {
    comingUp.push(`next timed section in ${daysUntilTimed}d`);
  }
  if (plan.mock && !plan.mock.today) {
    comingUp.push(`official mock in ${plan.mock.inDays}d`);
  }
  if (deck.scheduled > 0) {
    comingUp.push(
      `${deck.scheduled} deck card${deck.scheduled === 1 ? "" : "s"} scheduled ahead`,
    );
  }

  const tally: string[] = [];
  if (plan.mock?.today && progress.reportImported) {
    tally.push("mock report imported");
  }
  if (progress.timed) {
    tally.push(
      progress.timed.kind === "full"
        ? "a full timed section"
        : "a mini timed set",
    );
  }
  if (progress.drillDone > 0) {
    tally.push(
      `${progress.drillDone} drill question${progress.drillDone === 1 ? "" : "s"}`,
    );
  }
  if (progress.redosDone > 0) {
    tally.push(`${progress.redosDone} redo${progress.redosDone === 1 ? "" : "s"}`);
  }
  if (progress.deckFlipped > 0) {
    tally.push(
      `${progress.deckFlipped} card${progress.deckFlipped === 1 ? "" : "s"} graded`,
    );
  }
  if (progress.patternRounds > 0) {
    tally.push(
      `${progress.patternRounds} pattern round${progress.patternRounds === 1 ? "" : "s"}`,
    );
  }
  const accuracy =
    progress.attemptsToday > 0
      ? Math.round((progress.correctToday / progress.attemptsToday) * 100)
      : null;

  const dateLine = format(new Date(), "EEEE · MMMM d");

  // Largest-remainder rounding so the displayed percentages sum to 100,
  // the same apportionment style the plan uses for question counts.
  const pctBySkill = (() => {
    const exact = plan.drill.bySkill.map(({ skill }) => ({
      skill,
      exact: plan.weights[skill] * 100,
    }));
    const out = new Map(
      exact.map(({ skill, exact: e }) => [skill, Math.floor(e)]),
    );
    let assigned = [...out.values()].reduce((s, v) => s + v, 0);
    const byRemainder = [...exact].sort(
      (a, b) => (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact)),
    );
    for (let i = 0; assigned < 100; i = (i + 1) % byRemainder.length) {
      const key = byRemainder[i].skill;
      out.set(key, (out.get(key) ?? 0) + 1);
      assigned++;
    }
    return out;
  })();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-xl font-semibold">Today</h1>
            <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
              {dateLine}
            </span>
            {plan.phase && (
              <span className="rounded-control bg-highlight px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide">
                {PHASE_LABELS[plan.phase]}
              </span>
            )}
          </div>
          {days != null ? (
            <>
              <p className="mt-1 flex items-baseline gap-2">
                <Odometer
                  text={String(Math.max(0, days))}
                  className="font-display text-5xl font-bold"
                />
                <span className="text-sm text-graphite">days to the test</span>
              </p>
              {days < 0 && (
                <p className="mt-1 text-sm text-amber">
                  The test date has passed — set the next one under adjust.
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 max-w-md text-sm text-amber">
              No test date yet — set one and the plan paces itself: training
              phases, mock milestones, timed cadence.
            </p>
          )}
          {plan.phase && (
            <p className="mt-1.5 max-w-xl text-xs text-graphite">
              {PHASE_NOTES[plan.phase]}
            </p>
          )}
        </div>

        <PlanSettings
          testDate={testDate}
          cadence={cadence}
          defaultOpen={days == null}
        />
      </header>

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

      {verifiedCount === 0 && (
        <section className="rounded-card border border-amber/50 bg-highlight/60 px-4 py-3 shadow-ambient sm:px-5">
          <p className="text-sm">
            <span className="font-semibold">The question bank is empty.</span>{" "}
            <span className="text-graphite">
              Run{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                pnpm seed
              </code>{" "}
              to load the verified bank — drills, timed sets and the review
              loop all draw from it.
            </span>
          </p>
        </section>
      )}

      {next ? (
        <section className="relative overflow-hidden rounded-card border border-grid bg-surface p-5 pl-6 shadow-ambient sm:p-6 sm:pl-7">
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0 left-0 w-1",
              next.hero.tone === "amber" ? "bg-amber" : "bg-ballpoint",
            )}
          />
          <p
            className={cn(
              "font-mono text-[11px] font-semibold uppercase tracking-[0.18em]",
              next.hero.tone === "amber" ? "text-amber" : "text-ballpoint",
            )}
          >
            {next.hero.eyebrow}
          </p>
          <h2 className="mt-1.5 max-w-2xl font-display text-2xl font-semibold leading-snug">
            {next.hero.title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-graphite">
            {next.hero.body}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <Link
              href={next.hero.href}
              className="inline-flex items-center rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ballpoint/90"
            >
              {next.hero.cta} →
            </Link>
            <span className="text-xs text-graphite">
              {remainingAfterNext > 0
                ? `then ${remainingAfterNext} more below`
                : "the last item on today's list"}
            </span>
          </div>
        </section>
      ) : dayCleared ? (
        <section className="rounded-card border border-grid bg-surface px-5 py-8 text-center shadow-ambient sm:py-10">
          <h2 className="leading-none">
            <ClearedStamp label="Day cleared" />
          </h2>
          <p className="mt-5 text-sm font-medium">
            Everything on today&apos;s plan is in the book.
          </p>
          {(tally.length > 0 || accuracy != null) && (
            <p className="mx-auto mt-1 max-w-xl text-xs text-graphite">
              {tally.join(" · ")}
              {accuracy != null
                ? ` — ${progress.correctToday}/${progress.attemptsToday} correct (${accuracy}%)`
                : ""}
            </p>
          )}
          <p className="mt-4 text-xs text-graphite">
            Want more?{" "}
            <Link
              href="/mastery"
              className="font-medium text-ballpoint hover:underline"
            >
              Climb a ladder
            </Link>
            ,{" "}
            <Link
              href="/learn"
              className="font-medium text-ballpoint hover:underline"
            >
              read a chapter
            </Link>{" "}
            or{" "}
            <Link
              href="/drill"
              className="font-medium text-ballpoint hover:underline"
            >
              freestyle drill
            </Link>{" "}
            — or bank the win and rest.
          </p>
        </section>
      ) : null}

      <section className="rounded-card border border-grid bg-surface shadow-ambient">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-grid px-4 py-3 sm:px-5">
          <h2 className="font-display text-sm font-semibold">
            The day&apos;s work
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5" aria-hidden>
              {countable.map((i) => (
                <span
                  key={i.key}
                  className={cn(
                    "h-2 w-2 rounded-full border",
                    i.status === "done"
                      ? "border-ballpoint bg-ballpoint"
                      : "border-graphite/40",
                  )}
                />
              ))}
            </span>
            <span className="font-mono text-[11px] text-graphite">
              {doneCount}/{countable.length}
              <span className="sr-only"> done</span>
            </span>
          </div>
        </header>
        <ol className="divide-y divide-dashed divide-grid">
          {agenda.map((item) => (
            <li
              key={item.key}
              className={cn(
                "flex flex-wrap items-start gap-x-3 gap-y-1.5 px-4 py-3 sm:px-5",
                item === next && "bg-highlight/40",
              )}
            >
              <Marker status={item.status} />
              <div className="min-w-0 flex-1 basis-52">
                <p
                  className={cn(
                    "text-sm font-medium",
                    item.status === "done" &&
                      "text-graphite line-through decoration-graphite/50",
                    item.status === "unavailable" && "text-graphite",
                  )}
                >
                  <span className="sr-only">
                    {item.status === "done"
                      ? "Done: "
                      : item.status === "unavailable"
                        ? "Unavailable: "
                        : ""}
                  </span>
                  {item.title}
                  {item === next && (
                    <span className="ml-2 align-middle font-mono text-[10px] font-semibold uppercase tracking-wider text-ballpoint">
                      next
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-graphite">{item.meta}</p>
              </div>
              {item.status === "todo" && item.action ? (
                <Link
                  href={item.action.href}
                  className="shrink-0 text-sm font-medium text-ballpoint hover:underline"
                >
                  {item.action.label} →
                </Link>
              ) : item.note ? (
                <span className="shrink-0 pt-0.5 font-mono text-xs text-graphite">
                  {item.note}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        {comingUp.length > 0 && (
          <p className="border-t border-dashed border-grid px-4 py-2.5 font-mono text-[11px] text-graphite sm:px-5">
            Coming up: {comingUp.join(" · ")}
          </p>
        )}
      </section>

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient sm:p-5">
        <h2 className="font-display text-sm font-semibold">
          Skill weights driving today&apos;s mix
        </h2>
        <p className="mt-0.5 text-xs text-graphite">
          Rolling last-30-attempt accuracy blended 50/50 with the imported
          baseline; a 5% floor keeps every skill in rotation.
        </p>
        <div className="mt-4 space-y-3.5">
          {plan.drill.bySkill.map(({ skill, count: planned }) => {
            const pct = pctBySkill.get(skill) ?? 0;
            const record = inputs.skillAccuracy[skill];
            return (
              <div key={skill}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm">
                    {SKILL_LABELS[skill]}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-graphite">
                    {planned > 0 ? `${planned} today · ` : ""}
                    {record.total > 0
                      ? `${record.correct}/${record.total} recent`
                      : "no data yet"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-grid">
                    <div
                      className="h-full rounded-full bg-ballpoint"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-xs">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Marker({ status }: { status: AgendaStatus }) {
  if (status === "done") {
    return (
      <span
        className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-[4px] border border-grid"
        aria-hidden
      >
        {/* Red-pen tick, overshooting the box like a grader's mark. */}
        <svg
          viewBox="0 0 16 16"
          className="absolute -left-0.5 -top-1.5 h-5 w-5 overflow-visible"
        >
          <path
            d="M3.5 9.5 L7 13 L15.5 2.5"
            fill="none"
            stroke="var(--redpen)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "unavailable") {
    return (
      <span
        className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-dashed border-graphite/40"
        aria-hidden
      >
        <span className="h-px w-2 bg-graphite/50" />
      </span>
    );
  }
  return (
    <span
      className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-[4px] border border-graphite/50"
      aria-hidden
    />
  );
}
