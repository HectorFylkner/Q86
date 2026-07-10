import {
  and,
  desc,
  eq,
  gte,
  isNotNull,
  sql,
} from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  deckReviews,
  questions,
  sessions,
} from "./db/schema.ts";
import type { DailyPlan, PlanInputs } from "./plan.ts";
import {
  FUNDAMENTAL_SKILLS,
  SUBTOPIC_LABELS,
  type FundamentalSkill,
  type SessionMode,
  type Subtopic,
} from "./taxonomy.ts";

const PACE_TARGET_SECONDS = 135;
const RECENT_WINDOW = 30;
const WEAKEST_TOPIC_WINDOW = 120;
const MIN_WEAKEST_TOPIC_SAMPLE = 3;
const MIN_TRAINING_SIGNAL_SAMPLE = 21;
const MAX_WEEK_ATTEMPTS = 5_000;
const MAX_WEEK_SESSIONS = 1_000;
const MAX_WEEK_DECK_REVIEWS = 1_000;
const MAX_STREAK_DAYS = 400;

export type RecentAccuracy = {
  /** Accuracy percentage over the latest 30 verified focused attempts. */
  rate: number | null;
  /** Percentage-point change versus the preceding 30 attempts. */
  delta: number | null;
  correct: number;
  total: number;
  previousRate: number | null;
  previousTotal: number;
};

export type PaceSignal = {
  targetSeconds: 135;
  /** Share of the recent window answered within the target, 0..100. */
  rate: number | null;
  withinTarget: number;
  total: number;
  averageSeconds: number | null;
};

export type TodayCompletion = {
  completed: boolean;
  count: number;
  target: number | null;
  unit: "questions" | "rounds" | "reviews" | "sets";
};

export type TodayCompletions = {
  drill: TodayCompletion;
  redo: TodayCompletion;
  pattern: TodayCompletion;
  deck: TodayCompletion;
  timed: TodayCompletion;
};

export type StudyDayBar = {
  /** Local-calendar date, YYYY-MM-DD. */
  date: string;
  label: string;
  questions: number;
  correct: number;
  accuracy: number | null;
  minutes: number;
  active: boolean;
};

export type WeakestRecentSubtopic = {
  subtopic: Subtopic;
  label: string;
  accuracy: number;
  correct: number;
  sample: number;
};

export type TrainingSignalFactor = {
  value: number | null;
  weight: number;
  label: string;
  basis: string;
};

export type TrainingSignal = {
  /** A transparent practice signal, never a predicted GMAT score. */
  score: number | null;
  isPredictive: false;
  sample: number;
  minimumSample: 21;
  factors: {
    accuracy: TrainingSignalFactor;
    pace: TrainingSignalFactor;
    consistency: TrainingSignalFactor;
    coverage: TrainingSignalFactor;
  };
};

export type TodayPulse = {
  /** Lifetime verified focused question attempts. */
  attemptCount: number;
  recentAccuracy: RecentAccuracy;
  pace: PaceSignal;
  /** Consecutive active local-calendar days; yesterday keeps a streak alive. */
  streak: number;
  activeDaysLast7: number;
  study: {
    minutesLast7: number;
    questionsLast7: number;
    basis: "verified_focused_question_time";
  };
  today: TodayCompletions;
  bars: StudyDayBar[];
  weakestSubtopic: WeakestRecentSubtopic | null;
  trainingSignal: TrainingSignal;
};

type TelemetryAttempt = {
  id: number;
  sessionId: number | null;
  mode: SessionMode;
  correct: boolean;
  timeSeconds: number;
  createdAt: Date;
  skill: FundamentalSkill;
  subtopic: Subtopic;
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function percentage(correct: number, total: number): number | null {
  return total > 0 ? round1((correct / total) * 100) : null;
}

function sessionIsFocused(config: Record<string, unknown>): boolean {
  return config.focus !== "casual";
}

function isPatternRound(config: Record<string, unknown>): boolean {
  return config.kind !== "decision";
}

function completion(
  count: number,
  target: number | null,
  unit: TodayCompletion["unit"],
): TodayCompletion {
  return {
    completed: target == null ? count > 0 : count >= target,
    count,
    target,
    unit,
  };
}

function accuracyOf(rows: TelemetryAttempt[]): {
  rate: number | null;
  correct: number;
  total: number;
} {
  const correct = rows.filter((row) => row.correct).length;
  return { rate: percentage(correct, rows.length), correct, total: rows.length };
}

function weakestRecentSubtopic(
  rows: TelemetryAttempt[],
): WeakestRecentSubtopic | null {
  const bySubtopic = new Map<Subtopic, { correct: number; total: number }>();
  for (const row of rows.slice(0, WEAKEST_TOPIC_WINDOW)) {
    const current = bySubtopic.get(row.subtopic) ?? { correct: 0, total: 0 };
    current.total++;
    if (row.correct) current.correct++;
    bySubtopic.set(row.subtopic, current);
  }

  const ranked = [...bySubtopic.entries()]
    .filter(([, record]) => record.total >= MIN_WEAKEST_TOPIC_SAMPLE)
    .map(([subtopic, record]) => ({
      subtopic,
      label: SUBTOPIC_LABELS[subtopic],
      accuracy: percentage(record.correct, record.total) ?? 0,
      correct: record.correct,
      sample: record.total,
    }))
    .sort(
      (a, b) =>
        a.accuracy - b.accuracy ||
        b.sample - a.sample ||
        a.label.localeCompare(b.label),
    );
  return ranked[0] ?? null;
}

function consecutiveDayStreak(activeDays: Set<string>, today: Date): number {
  let cursor = today;
  if (!activeDays.has(localDateKey(cursor))) cursor = addLocalDays(cursor, -1);

  let streak = 0;
  while (streak < MAX_STREAK_DAYS && activeDays.has(localDateKey(cursor))) {
    streak++;
    cursor = addLocalDays(cursor, -1);
  }
  return streak;
}

/**
 * Dashboard telemetry over verified, focused question attempts. Pattern
 * rounds and deck grades participate only in activity/completion signals,
 * because neither is a verified-question attempt. All history reads are
 * either fixed-size recent windows, seven-day ranges, or distinct day keys.
 */
export async function gatherTodayPulse(
  inputs: PlanInputs,
  plan: DailyPlan,
): Promise<TodayPulse> {
  const now = new Date();
  const todayStart = startOfLocalDay(now);
  const weekStart = addLocalDays(todayStart, -6);
  const streakStart = addLocalDays(todayStart, -MAX_STREAK_DAYS);
  const todayKey = localDateKey(todayStart);

  const attemptDay = sql<string | null>`strftime('%Y-%m-%d', ${attempts.createdAt} / 1000, 'unixepoch', 'localtime')`;
  const patternDay = sql<string | null>`strftime('%Y-%m-%d', ${sessions.endedAt} / 1000, 'unixepoch', 'localtime')`;
  const deckDay = sql<string | null>`strftime('%Y-%m-%d', ${deckReviews.updatedAt} / 1000, 'unixepoch', 'localtime')`;

  const attemptWhere = and(
    eq(attempts.focus, "focused"),
    eq(questions.verified, true),
  );

  const [
    recentRows,
    weekRows,
    weekSessionRows,
    weekDeckRows,
    attemptDays,
    patternDays,
    deckDays,
  ] = await Promise.all([
    db
      .select({
        id: attempts.id,
        sessionId: attempts.sessionId,
        mode: attempts.mode,
        correct: attempts.correct,
        timeSeconds: attempts.timeSeconds,
        createdAt: attempts.createdAt,
        skill: questions.fundamentalSkill,
        subtopic: questions.subtopic,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(attemptWhere)
      .orderBy(desc(attempts.id))
      .limit(WEAKEST_TOPIC_WINDOW)
      .all(),
    db
      .select({
        id: attempts.id,
        sessionId: attempts.sessionId,
        mode: attempts.mode,
        correct: attempts.correct,
        timeSeconds: attempts.timeSeconds,
        createdAt: attempts.createdAt,
        skill: questions.fundamentalSkill,
        subtopic: questions.subtopic,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(and(attemptWhere, gte(attempts.createdAt, weekStart)))
      .orderBy(desc(attempts.id))
      .limit(MAX_WEEK_ATTEMPTS)
      .all(),
    db
      .select({
        id: sessions.id,
        mode: sessions.mode,
        config: sessions.config,
        endedAt: sessions.endedAt,
      })
      .from(sessions)
      .where(
        and(gte(sessions.endedAt, weekStart), isNotNull(sessions.endedAt)),
      )
      .orderBy(desc(sessions.endedAt))
      .limit(MAX_WEEK_SESSIONS)
      .all(),
    db
      .select({ updatedAt: deckReviews.updatedAt })
      .from(deckReviews)
      .where(gte(deckReviews.updatedAt, weekStart))
      .orderBy(desc(deckReviews.updatedAt))
      .limit(MAX_WEEK_DECK_REVIEWS)
      .all(),
    db
      .select({ date: attemptDay })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(and(attemptWhere, gte(attempts.createdAt, streakStart)))
      .groupBy(attemptDay)
      .orderBy(desc(attemptDay))
      .limit(MAX_STREAK_DAYS)
      .all(),
    db
      .select({ date: patternDay })
      .from(sessions)
      .where(
        and(
          eq(sessions.mode, "pattern"),
          isNotNull(sessions.endedAt),
          gte(sessions.endedAt, streakStart),
          sql`coalesce(json_extract(${sessions.config}, '$.kind'), '') != 'decision'`,
        ),
      )
      .groupBy(patternDay)
      .orderBy(desc(patternDay))
      .limit(MAX_STREAK_DAYS)
      .all(),
    db
      .select({ date: deckDay })
      .from(deckReviews)
      .where(gte(deckReviews.updatedAt, streakStart))
      .groupBy(deckDay)
      .orderBy(desc(deckDay))
      .limit(MAX_STREAK_DAYS)
      .all(),
  ]);

  const recentAttempts = recentRows as TelemetryAttempt[];
  const weekAttempts = weekRows as TelemetryAttempt[];
  const currentRows = recentAttempts.slice(0, RECENT_WINDOW);
  const previousRows = recentAttempts.slice(
    RECENT_WINDOW,
    RECENT_WINDOW * 2,
  );
  const currentAccuracy = accuracyOf(currentRows);
  const previousAccuracy = accuracyOf(previousRows);
  const recentAccuracy: RecentAccuracy = {
    ...currentAccuracy,
    delta:
      currentAccuracy.rate == null || previousAccuracy.rate == null
        ? null
        : round1(currentAccuracy.rate - previousAccuracy.rate),
    previousRate: previousAccuracy.rate,
    previousTotal: previousAccuracy.total,
  };

  const withinTarget = currentRows.filter(
    (row) => row.timeSeconds <= PACE_TARGET_SECONDS,
  ).length;
  const pace: PaceSignal = {
    targetSeconds: PACE_TARGET_SECONDS,
    rate: percentage(withinTarget, currentRows.length),
    withinTarget,
    total: currentRows.length,
    averageSeconds:
      currentRows.length > 0
        ? round1(
            currentRows.reduce((sum, row) => sum + row.timeSeconds, 0) /
              currentRows.length,
          )
        : null,
  };

  const activeDays = new Set(
    [...attemptDays, ...patternDays, ...deckDays]
      .map((row) => row.date)
      .filter((date): date is string => date != null),
  );
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addLocalDays(weekStart, index),
  );
  const bars: StudyDayBar[] = weekDates.map((date) => {
    const key = localDateKey(date);
    const rows = weekAttempts.filter(
      (attempt) => localDateKey(new Date(attempt.createdAt)) === key,
    );
    const correct = rows.filter((row) => row.correct).length;
    return {
      date: key,
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      questions: rows.length,
      correct,
      accuracy: percentage(correct, rows.length),
      minutes: round1(
        rows.reduce((sum, row) => sum + row.timeSeconds, 0) / 60,
      ),
      active: activeDays.has(key),
    };
  });

  const completedSessions = weekSessionRows.filter(
    (row) => row.endedAt != null && sessionIsFocused(row.config),
  );
  const completedSessionIds = new Set(completedSessions.map((row) => row.id));
  const todayAttempts = weekAttempts.filter(
    (row) => localDateKey(new Date(row.createdAt)) === todayKey,
  );
  const todayCompletedAttempts = todayAttempts.filter(
    (row) => row.sessionId != null && completedSessionIds.has(row.sessionId),
  );
  const todaySessions = completedSessions.filter(
    (row) =>
      row.endedAt != null && localDateKey(new Date(row.endedAt)) === todayKey,
  );
  const todayDeckReviews = weekDeckRows.filter(
    (row) => localDateKey(new Date(row.updatedAt)) === todayKey,
  ).length;
  const todayTimedSets = new Set(
    todayCompletedAttempts
      .filter(
        (row) => row.mode === "timed_set" || row.mode === "section_sim",
      )
      .map((row) => row.sessionId)
      .filter((id): id is number => id != null),
  ).size;
  const todayPatternRounds = todaySessions.filter(
    (row) => row.mode === "pattern" && isPatternRound(row.config),
  ).length;
  const drillQuestions = todayCompletedAttempts.filter(
    (row) => row.mode === "drill",
  ).length;
  const redoQuestions = todayCompletedAttempts.filter(
    (row) => row.mode === "redo",
  ).length;

  const today: TodayCompletions = {
    drill: completion(drillQuestions, plan.drill.total, "questions"),
    redo: completion(redoQuestions, inputs.dueRedoCount, "questions"),
    pattern: completion(
      todayPatternRounds,
      plan.patternRounds.length,
      "rounds",
    ),
    deck: completion(todayDeckReviews, null, "reviews"),
    timed: completion(todayTimedSets, plan.timed.due ? 1 : 0, "sets"),
  };

  const activeDaysLast7 = bars.filter((bar) => bar.active).length;
  const skillSamples = new Map<FundamentalSkill, number>();
  for (const row of recentAttempts) {
    skillSamples.set(row.skill, (skillSamples.get(row.skill) ?? 0) + 1);
  }
  const coveredSkills = FUNDAMENTAL_SKILLS.filter(
    (skill) => (skillSamples.get(skill) ?? 0) >= 3,
  ).length;
  const factorValues = {
    accuracy: recentAccuracy.rate,
    pace: pace.rate,
    consistency: round1((activeDaysLast7 / 7) * 100),
    coverage: round1((coveredSkills / FUNDAMENTAL_SKILLS.length) * 100),
  };
  const factorWeights = {
    accuracy: 0.45,
    pace: 0.25,
    consistency: 0.2,
    coverage: 0.1,
  } as const;
  const enoughSignal =
    inputs.focusedAttemptCount >= MIN_TRAINING_SIGNAL_SAMPLE &&
    currentRows.length >= MIN_TRAINING_SIGNAL_SAMPLE &&
    factorValues.accuracy != null &&
    factorValues.pace != null;
  const score = enoughSignal
    ? Math.round(
        factorValues.accuracy! * factorWeights.accuracy +
          factorValues.pace! * factorWeights.pace +
          factorValues.consistency * factorWeights.consistency +
          factorValues.coverage * factorWeights.coverage,
      )
    : null;
  const trainingSignal: TrainingSignal = {
    score,
    isPredictive: false,
    sample: currentRows.length,
    minimumSample: MIN_TRAINING_SIGNAL_SAMPLE,
    factors: {
      accuracy: {
        value: factorValues.accuracy,
        weight: factorWeights.accuracy,
        label: "Recent accuracy",
        basis: "Latest 30 verified focused attempts",
      },
      pace: {
        value: factorValues.pace,
        weight: factorWeights.pace,
        label: "On-pace answers",
        basis: `Share of the latest 30 at or under ${PACE_TARGET_SECONDS}s`,
      },
      consistency: {
        value: factorValues.consistency,
        weight: factorWeights.consistency,
        label: "Seven-day consistency",
        basis: `${activeDaysLast7} active local-calendar days out of 7`,
      },
      coverage: {
        value: factorValues.coverage,
        weight: factorWeights.coverage,
        label: "Skill coverage",
        basis: `${coveredSkills} of ${FUNDAMENTAL_SKILLS.length} skills with at least 3 recent attempts`,
      },
    },
  };

  return {
    attemptCount: inputs.focusedAttemptCount,
    recentAccuracy,
    pace,
    streak: consecutiveDayStreak(activeDays, todayStart),
    activeDaysLast7,
    study: {
      minutesLast7: round1(
        weekAttempts.reduce((sum, row) => sum + row.timeSeconds, 0) / 60,
      ),
      questionsLast7: weekAttempts.length,
      basis: "verified_focused_question_time",
    },
    today,
    bars,
    weakestSubtopic: weakestRecentSubtopic(recentAttempts),
    trainingSignal,
  };
}
