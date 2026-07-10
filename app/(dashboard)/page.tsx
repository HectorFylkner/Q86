import {
  ArrowRight,
  Books,
  CalendarDots,
  CaretDown,
  CheckCircle,
  CircleDashed,
  ClockCountdown,
  Crosshair,
  Fire,
  Gauge,
  Lightning,
  Path,
  Stack,
  Target,
  Timer,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { Odometer } from "@/components/odometer";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { todaysDeck } from "@/lib/deck";
import { PATTERN_CATEGORY_LABELS } from "@/lib/generators";
import { gatherPlanInputs } from "@/lib/plan-server";
import { computeDailyPlan, PHASE_LABELS, PHASE_NOTES } from "@/lib/plan";
import { getSetting } from "@/lib/settings";
import { SKILL_LABELS, SKILL_SHORT_LABELS } from "@/lib/taxonomy";
import { gatherTodayPulse, type TodayCompletion } from "@/lib/today";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MissionStatus = "active" | "done" | "queued" | "scheduled";

type Mission = {
  id: "review" | "patterns" | "drill" | "timed";
  eyebrow: string;
  title: string;
  detail: string;
  estimate: string;
  href: string;
  action: string;
  status: MissionStatus;
  progress?: TodayCompletion;
  icon: React.ReactNode;
};

const PHASE_HEADLINES = {
  foundations: "Build the base that speed can trust.",
  accuracy: "Turn every miss into a repeatable method.",
  speed: "Make cleaner decisions under a live clock.",
  peak: "Protect the work. Keep the blade sharp.",
} as const;

export default async function TodayPage() {
  const inputs = await gatherPlanInputs();
  const plan = computeDailyPlan(inputs);
  const [verifiedCount, deck, testDate, pulse] = await Promise.all([
    db
      .select({ n: count() })
      .from(questions)
      .where(eq(questions.verified, true))
      .get()
      .then((row) => row?.n ?? 0),
    todaysDeck(),
    getSetting("test_date"),
    gatherTodayPulse(inputs, plan),
  ]);

  const days = inputs.daysToTest;
  const firstRun = inputs.focusedAttemptCount === 0;
  const deckWaiting = deck.due + deck.fresh;
  const reviewClear = plan.dueRedoCount === 0 && deckWaiting === 0;
  const patternsDone = pulse.today.pattern.completed;
  const drillDone = pulse.today.drill.completed;
  const timedDone = pulse.today.timed.count > 0;

  const missions: Mission[] = [
    {
      id: "review",
      eyebrow: "Protect the learning",
      title: reviewClear
        ? "Review debt is clear"
        : `${plan.dueRedoCount + deckWaiting} recall${plan.dueRedoCount + deckWaiting === 1 ? "" : "s"} waiting`,
      detail: reviewClear
        ? "Nothing is decaying in the redo queue or takeaway deck."
        : [
            plan.dueRedoCount > 0
              ? `${plan.dueRedoCount} exact redo${plan.dueRedoCount === 1 ? "" : "s"}`
              : null,
            deckWaiting > 0
              ? `${deckWaiting} takeaway card${deckWaiting === 1 ? "" : "s"}`
              : null,
          ]
            .filter(Boolean)
            .join(" · "),
      estimate: reviewClear
        ? "clear"
        : `~${Math.max(3, Math.ceil(plan.dueRedoCount * 2.5 + deckWaiting * 0.6))} min`,
      href: plan.dueRedoCount > 0 ? "/queue?start=1" : "/deck",
      action: plan.dueRedoCount > 0 ? "Clear due redos" : "Open the deck",
      status: reviewClear ? "done" : "queued",
      progress: pulse.today.redo,
      icon: <Stack size={19} weight="duotone" aria-hidden />,
    },
    {
      id: "patterns",
      eyebrow: "Prime recognition",
      title: "Two rapid pattern rounds",
      detail: plan.patternRounds
        .map((key) => PATTERN_CATEGORY_LABELS[key])
        .join(" · "),
      estimate: "~4 min",
      href: `/patterns?start=${plan.patternRounds[0]}`,
      action: "Start the first round",
      status: patternsDone ? "done" : "queued",
      progress: pulse.today.pattern,
      icon: <Lightning size={19} weight="duotone" aria-hidden />,
    },
    {
      id: "drill",
      eyebrow: firstRun ? "Establish the baseline" : "Attack the evidence",
      title: firstRun
        ? `Balanced baseline · ${plan.drill.total} questions`
        : `Adaptive drill · ${plan.drill.total} questions`,
      detail: plan.drill.bySkill
        .filter(({ count }) => count > 0)
        .map(({ skill, count }) => `${SKILL_SHORT_LABELS[skill]} ${count}`)
        .join(" · "),
      estimate: `~${Math.ceil(plan.drill.total * 2.5)} min`,
      href: "/drill?plan=1",
      action: firstRun ? "Build the baseline" : "Start adaptive drill",
      status: drillDone ? "done" : "queued",
      progress: pulse.today.drill,
      icon: <Crosshair size={19} weight="duotone" aria-hidden />,
    },
    {
      id: "timed",
      eyebrow: "Pressure test",
      title: plan.timed.due ? "Full 21-question section" : "Next timed section",
      detail: plan.timed.due
        ? "A completed-session cadence says it is time to test pacing."
        : `Scheduled in ${plan.timed.inDays} ${plan.timed.inDays === 1 ? "day" : "days"} · every ${plan.timed.cadenceDays} days`,
      estimate: plan.timed.due ? "45 min" : "scheduled",
      href: plan.timed.due ? "/timed?start=full" : "/timed",
      action: plan.timed.due ? "Start full section" : "View timed sets",
      status: timedDone
        ? "done"
        : plan.timed.due
          ? "queued"
          : "scheduled",
      progress: pulse.today.timed,
      icon: <Timer size={19} weight="duotone" aria-hidden />,
    },
  ];

  const nextMission =
    (reviewClear ? null : missions.find((mission) => mission.id === "review")) ??
    (plan.timed.due
      ? missions.find((mission) => mission.id === "timed" && mission.status !== "done")
      : null) ??
    missions.find((mission) => mission.id === "drill" && mission.status !== "done") ??
    missions.find((mission) => mission.id === "patterns" && mission.status !== "done") ??
    missions.find((mission) => mission.status !== "done" && mission.status !== "scheduled") ??
    null;

  if (nextMission) nextMission.status = "active";

  const completedCount = missions.filter((mission) => mission.status === "done").length;
  const activeMissions = missions.filter((mission) => mission.status !== "scheduled");
  const headline = plan.phase
    ? PHASE_HEADLINES[plan.phase]
    : "One focused block moves the line.";
  const todayLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-10 pb-4">
      <header className="grid gap-8 border-b border-grid-strong pb-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.8fr)] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-graphite">
            <span>{todayLabel}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-grid-strong" />
            <span>{plan.phase ? PHASE_LABELS[plan.phase] : "Open training"}</span>
          </div>

          <h1 className="mt-4 max-w-[17ch] font-display text-[clamp(2rem,5vw,3.65rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            {headline}
          </h1>

          <div className="mt-6 flex flex-wrap items-end gap-x-7 gap-y-4">
            {days != null ? (
              <div className="flex items-end gap-3">
                <Odometer
                  text={String(Math.max(0, days))}
                  className="font-mono text-6xl font-semibold leading-none tracking-[-0.08em] text-ballpoint sm:text-7xl"
                />
                <span className="max-w-24 pb-1 text-sm leading-tight text-graphite">
                  days to the test
                </span>
              </div>
            ) : (
              <div className="border-l-2 border-amber pl-4">
                <p className="font-display text-lg font-semibold">
                  Set the date. Train backwards.
                </p>
                <p className="mt-1 max-w-md text-sm leading-6 text-graphite">
                  The plan can change volume, pacing, and mock milestones once
                  it knows the finish line.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 divide-x divide-grid overflow-hidden rounded-control border border-grid bg-surface/70">
              <HeroMetric
                label="streak"
                value={`${pulse.streak}d`}
                icon={<Fire size={15} aria-hidden />}
              />
              <HeroMetric
                label="this week"
                value={`${pulse.study.minutesLast7}m`}
                icon={<ClockCountdown size={15} aria-hidden />}
              />
              <HeroMetric
                label="accuracy"
                value={
                  pulse.recentAccuracy.rate == null
                    ? "—"
                    : `${Math.round(pulse.recentAccuracy.rate)}%`
                }
                icon={<TrendUp size={15} aria-hidden />}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {nextMission ? (
              <Link
                href={nextMission.href}
                className="group inline-flex min-h-12 items-center gap-3 rounded-control bg-ballpoint px-5 py-2.5 text-sm font-semibold text-white shadow-raised transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-ballpoint/92"
              >
                <Target size={19} weight="bold" aria-hidden />
                {nextMission.action}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : (
              <Link
                href="/analytics"
                className="inline-flex min-h-12 items-center gap-3 rounded-control bg-ballpoint px-5 py-2.5 text-sm font-semibold text-white shadow-raised"
              >
                Read today&apos;s evidence
                <ArrowRight size={18} aria-hidden />
              </Link>
            )}
            <span className="text-[13px] text-graphite">
              {nextMission
                ? `${nextMission.estimate} · ${nextMission.eyebrow.toLowerCase()}`
                : "Daily route complete"}
            </span>
          </div>
        </div>

        <TrainingSignal pulse={pulse} />
      </header>

      {firstRun && (
        <section className="grid gap-5 border-l-2 border-ballpoint bg-ballpoint/[0.045] px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ballpoint/25 bg-surface text-ballpoint">
            <Path size={22} weight="duotone" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Your first evidence loop
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-graphite">
              Read one chapter if a concept feels rusty, then run the balanced
              baseline. Every miss becomes a takeaway, redo, and planning
              signal automatically.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ballpoint hover:underline"
          >
            Browse chapters
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      )}

      <section aria-labelledby="daily-route-title" className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.72fr)] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-grid-strong pb-4">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-graphite">
                Today&apos;s route
              </p>
              <h2
                id="daily-route-title"
                className="mt-1 font-display text-2xl font-semibold tracking-tight"
              >
                One sequence, not four competing cards.
              </h2>
            </div>
            <span className="font-mono text-xs text-graphite">
              {completedCount}/{activeMissions.length} complete
            </span>
          </div>

          <ol className="divide-y divide-grid">
            {missions.map((mission, index) => (
              <MissionRow key={mission.id} mission={mission} index={index} />
            ))}
          </ol>
        </div>

        <aside className="space-y-8">
          <WeekEvidence pulse={pulse} />

          <section className="border-t border-grid-strong pt-5">
            <div className="flex items-center gap-2 text-ballpoint">
              <Gauge size={18} weight="duotone" aria-hidden />
              <h2 className="font-display text-base font-semibold text-ink">
                Highest-leverage focus
              </h2>
            </div>
            {pulse.weakestSubtopic ? (
              <>
                <p className="mt-3 font-display text-xl font-semibold tracking-tight">
                  {pulse.weakestSubtopic.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-graphite">
                  {Math.round(pulse.weakestSubtopic.accuracy)}% over the most
                  recent {pulse.weakestSubtopic.sample} attempts with enough
                  evidence to act.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                  <Link
                    href={`/drill?sub=${pulse.weakestSubtopic.subtopic}&d=3`}
                    className="text-ballpoint hover:underline"
                  >
                    Drill this focus
                  </Link>
                  <Link
                    href={`/learn/${pulse.weakestSubtopic.subtopic}`}
                    className="text-graphite hover:text-ink hover:underline"
                  >
                    Revisit the chapter
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-graphite">
                No subtopic has three focused attempts yet. The balanced drill
                creates enough evidence for a specific recommendation.
              </p>
            )}
          </section>
        </aside>
      </section>

      <section aria-labelledby="mix-title" className="border-t border-grid-strong pt-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.6fr)_minmax(0,1.4fr)] lg:gap-12">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-graphite">
              Why this mix
            </p>
            <h2
              id="mix-title"
              className="mt-1 font-display text-2xl font-semibold tracking-tight"
            >
              Evidence becomes allocation.
            </h2>
            <p className="mt-2 text-sm leading-6 text-graphite">
              Recent accuracy and the latest imported baseline share the vote.
              A 5% floor keeps every core skill alive.
            </p>
            {plan.phase && (
              <div className="mt-5 border-l-2 border-ballpoint pl-4">
                <p className="text-sm font-semibold">{PHASE_LABELS[plan.phase]}</p>
                <p className="mt-1 text-[13px] leading-5 text-graphite">
                  {PHASE_NOTES[plan.phase]}
                </p>
              </div>
            )}
          </div>

          <div className="divide-y divide-grid border-y border-grid">
            {plan.drill.bySkill.map(({ skill, count }) => {
              const weight = plan.weights[skill];
              const record = inputs.skillAccuracy[skill];
              return (
                <div key={skill} className="grid gap-2 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-5">
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] font-medium sm:text-sm">
                        {SKILL_LABELS[skill]}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-graphite sm:hidden">
                        {Math.round(weight * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-grid">
                      <div
                        className="h-full origin-left rounded-full bg-ballpoint"
                        style={{ width: `${Math.round(weight * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-xs sm:justify-end">
                    <span className="font-mono text-ink">
                      {Math.round(weight * 100)}%
                    </span>
                    <span className="w-24 text-right font-mono text-graphite">
                      {record.total > 0
                        ? `${record.correct}/${record.total} recent`
                        : "no evidence"}
                    </span>
                    <span className="w-12 text-right font-mono text-ballpoint">
                      {count} Q
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <details className="group border-t border-grid-strong pt-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:content-none">
          <span className="flex items-center gap-2">
            <CalendarDots size={18} className="text-graphite" aria-hidden />
            Plan controls
          </span>
          <span className="flex items-center gap-2 font-normal text-graphite">
            {testDate ? `Test ${testDate}` : "No test date"} · timed every {inputs.cadenceDays}d
            <CaretDown
              size={16}
              className="transition-transform group-open:rotate-180"
              aria-hidden
            />
          </span>
        </summary>
        <div className="mt-4 max-w-3xl rounded-card border border-grid bg-surface p-4 sm:p-5">
          <SettingsForm testDate={testDate} cadence={inputs.cadenceDays} />
        </div>
      </details>

      <p className="font-mono text-[11px] text-faint">
        {verifiedCount} trusted questions available · training signal uses
        focused, verified attempts only · official mocks remain the score
        measure
      </p>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-[5.5rem] px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-graphite">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </span>
      <span className="mt-1 block font-mono text-base font-semibold">{value}</span>
    </div>
  );
}

function TrainingSignal({
  pulse,
}: {
  pulse: Awaited<ReturnType<typeof gatherTodayPulse>>;
}) {
  const signal = pulse.trainingSignal;
  const score = signal.score;
  const gaugeStyle = {
    background:
      score == null
        ? "var(--grid)"
        : `conic-gradient(var(--ballpoint) ${score * 3.6}deg, var(--grid) 0deg)`,
  };

  return (
    <section className="border-t border-grid-strong pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1" aria-labelledby="training-signal-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-graphite">
            Training signal
          </p>
          <h2 id="training-signal-title" className="mt-1 font-display text-lg font-semibold">
            Readiness, with receipts.
          </h2>
        </div>
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full p-[5px]"
          style={gaugeStyle}
          aria-label={
            score == null
              ? `Training signal pending; ${signal.sample} of ${signal.minimumSample} attempts collected`
              : `Training signal ${score} out of 100`
          }
        >
          <span className="grid h-full w-full place-items-center rounded-full bg-paper font-mono text-xl font-semibold">
            {score ?? "—"}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-5 text-graphite">
        {score == null
          ? `${signal.sample}/${signal.minimumSample} focused attempts collected. The signal appears only when the sample can support it.`
          : "A transparent practice composite—not a predicted GMAT score."}
      </p>

      <dl className="mt-5 divide-y divide-grid border-y border-grid">
        {Object.values(signal.factors).map((factor) => (
          <div key={factor.label} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
            <dt className="text-graphite">{factor.label}</dt>
            <dd className="font-mono font-medium">
              {factor.value == null ? "—" : `${Math.round(factor.value)}%`}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MissionRow({ mission, index }: { mission: Mission; index: number }) {
  const statusLabel = {
    active: "Next up",
    done: "Complete",
    queued: "Queued",
    scheduled: "Scheduled",
  }[mission.status];
  const progress = mission.progress;
  const progressPercent =
    progress?.target && progress.target > 0
      ? Math.min(100, (progress.count / progress.target) * 100)
      : mission.status === "done"
        ? 100
        : 0;

  return (
    <li
      className={cn(
        "relative grid gap-3 py-5 pl-11 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:pl-14",
        mission.status === "scheduled" && "opacity-75",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-5 flex h-8 w-8 items-center justify-center rounded-full border bg-paper",
          mission.status === "active" && "border-ballpoint bg-ballpoint text-white",
          mission.status === "done" && "border-ballpoint/35 text-ballpoint",
          (mission.status === "queued" || mission.status === "scheduled") &&
            "border-grid-strong text-graphite",
        )}
      >
        {mission.status === "done" ? (
          <CheckCircle size={19} weight="fill" aria-hidden />
        ) : mission.status === "active" ? (
          mission.icon
        ) : (
          <CircleDashed size={18} aria-hidden />
        )}
      </span>
      {index < 3 && (
        <span aria-hidden className="absolute bottom-[-1px] left-[15px] top-[3.35rem] w-px bg-grid" />
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-[0.13em]",
              mission.status === "active" ? "text-ballpoint" : "text-graphite",
            )}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] text-faint">{mission.eyebrow}</span>
        </div>
        <h3 className="mt-1 font-display text-[17px] font-semibold tracking-tight">
          {mission.title}
        </h3>
        <p className="mt-1 text-[13px] leading-5 text-graphite">{mission.detail}</p>
        {progress && progress.target != null && progress.target > 0 && mission.status !== "scheduled" && (
          <div className="mt-3 flex max-w-md items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-grid">
              <div
                className="h-full origin-left rounded-full bg-ballpoint"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-graphite">
              {progress.count}/{progress.target}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="font-mono text-[11px] text-graphite">{mission.estimate}</span>
        <Link
          href={mission.href}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-control px-3.5 text-sm font-semibold transition-colors",
            mission.status === "active"
              ? "bg-ballpoint text-white"
              : "border border-grid-strong bg-surface text-ink hover:border-ballpoint/45 hover:text-ballpoint",
          )}
        >
          {mission.status === "done" ? "Open" : mission.action}
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </li>
  );
}

function WeekEvidence({
  pulse,
}: {
  pulse: Awaited<ReturnType<typeof gatherTodayPulse>>;
}) {
  const maxQuestions = Math.max(1, ...pulse.bars.map((bar) => bar.questions));

  return (
    <section aria-labelledby="week-evidence-title">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Books size={18} weight="duotone" className="text-ballpoint" aria-hidden />
          <h2 id="week-evidence-title" className="font-display text-base font-semibold">
            Seven-day evidence
          </h2>
        </div>
        <span className="font-mono text-[11px] text-graphite">
          {pulse.activeDaysLast7}/7 active
        </span>
      </div>

      <div className="mt-4 grid h-28 grid-cols-7 items-end gap-2 border-b border-grid-strong pb-2" aria-label="Questions completed in the last seven days">
        {pulse.bars.map((bar) => {
          const height = bar.questions > 0 ? Math.max(12, (bar.questions / maxQuestions) * 78) : 3;
          return (
            <div key={bar.date} className="flex h-full flex-col items-center justify-end gap-1.5" title={`${bar.date}: ${bar.questions} questions, ${bar.minutes} minutes`}>
              <span className="font-mono text-[9px] text-faint">
                {bar.questions || (bar.active ? "·" : "")}
              </span>
              <span
                className={cn(
                  "w-full max-w-7 rounded-t-[4px]",
                  bar.active ? "bg-ballpoint" : "bg-grid",
                )}
                style={{ height }}
              />
              <span className="font-mono text-[9px] text-graphite">{bar.label.slice(0, 1)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[12px] text-graphite">
        <span>{pulse.study.questionsLast7} questions</span>
        <span>{pulse.study.minutesLast7} focused minutes</span>
      </div>
    </section>
  );
}
