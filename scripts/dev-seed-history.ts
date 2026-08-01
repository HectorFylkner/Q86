/**
 * DEVELOPMENT ONLY — synthetic training history.
 *
 * Fills the database with several weeks of plausible attempts, sessions,
 * edits, redo-queue state, deck scheduling, pattern rounds with ELO
 * movement, and one imported score report, so that Today, Learn, Drill,
 * Review, Trainers and Progress render *populated* rather than empty.
 * It exists to make design and diagnostic work reviewable and to give
 * the screenshot capture something to photograph. It is never wired into
 * `pnpm seed` and never runs in production.
 *
 * Idempotent: the whole synthetic history is regenerated from a fixed
 * RNG seed, so running it twice yields the same database. It refuses to
 * run when the database already holds real (non-synthetic) attempts
 * unless you pass --force, because a real attempt history is the user's
 * irreplaceable training record.
 *
 * Usage:
 *   node --experimental-strip-types scripts/dev-seed-history.ts
 *   node --experimental-strip-types scripts/dev-seed-history.ts --force
 *   node --experimental-strip-types scripts/dev-seed-history.ts --days=60
 */

import { sql } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { ensureDbReady } from "../lib/db/bootstrap.ts";
import {
  attempts,
  baselineReports,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  questions,
  redoQueue,
  sessions,
  settings,
} from "../lib/db/schema.ts";
import { ELO_START, nextRating } from "../lib/elo.ts";
import { PATTERN_CATEGORY_KEYS } from "../lib/generators/index.ts";
import { mulberry32, pick, randInt, shuffle } from "../lib/generators/rng.ts";
import { TIME_BENCH } from "../lib/pacing.ts";
import { COLD_SOLVE_LIMIT_SECONDS } from "../lib/redo.ts";
import { nextReview, type ReviewGrade, type ReviewState } from "../lib/srs.ts";
import {
  FUNDAMENTAL_SKILLS,
  type Confidence,
  type Difficulty,
  type ErrorType,
  type FundamentalSkill,
} from "../lib/taxonomy.ts";

if (process.env.NODE_ENV === "production") {
  console.error("dev-seed-history is a development tool; refusing to run with NODE_ENV=production.");
  process.exit(1);
}

const SYNTHETIC_TAG = "dev-history";
const DAY_MS = 86_400_000;
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DAYS = Number(args.find((a) => a.startsWith("--days="))?.slice(7) ?? 42);
const SEED = Number(args.find((a) => a.startsWith("--seed="))?.slice(7) ?? 8686);

const rng = mulberry32(SEED);

/** Standard normal via Box–Muller, on the shared deterministic stream. */
function gauss(): number {
  const u = Math.max(rng(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function chance(p: number): boolean {
  return rng() < p;
}

/** Weighted pick from [item, weight] pairs. */
function weighted<T>(pairs: Array<[T, number]>): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [item, w] of pairs) {
    r -= w;
    if (r <= 0) return item;
  }
  return pairs[pairs.length - 1][0];
}

/** Local midnight `back` days before today, then a time-of-day offset. */
function atDay(back: number, hour: number, minute = 0): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
  d.setHours(hour, minute, Math.floor(rng() * 60), 0);
  return d;
}

// ---------------------------------------------------------------------------
// The simulated student
// ---------------------------------------------------------------------------

/**
 * Per-skill accuracy at the start and end of the window. Rates/ratio/percent
 * is the persistent weakness (so the plan has something to weight toward),
 * Value/Order/Factors the strength. Everything improves, unevenly.
 */
const SKILL_CURVE: Record<FundamentalSkill, { from: number; to: number }> = {
  value_order_factors: { from: 0.64, to: 0.84 },
  equal_unequal_alg: { from: 0.56, to: 0.75 },
  rates_ratio_percent: { from: 0.44, to: 0.63 },
  counting_sets_series_prob_stats: { from: 0.52, to: 0.72 },
};

/** Difficulty tilts accuracy around the skill curve. */
const DIFFICULTY_SHIFT: Record<Difficulty, number> = {
  1: 0.14,
  2: 0.1,
  3: 0.0,
  4: -0.09,
  5: -0.18,
};

/** How a miss gets classified, before mode-specific adjustments. */
const ERROR_MIX: Array<[ErrorType, number]> = [
  ["content_gap", 22],
  ["setup_error", 26],
  ["calculation_error", 20],
  ["misread", 14],
  ["time_pressure", 12],
  ["guess", 6],
];

function accuracyFor(
  skill: FundamentalSkill,
  difficulty: Difficulty,
  progress: number,
): number {
  const curve = SKILL_CURVE[skill];
  const base = curve.from + (curve.to - curve.from) * progress;
  return Math.min(0.97, Math.max(0.05, base + DIFFICULTY_SHIFT[difficulty]));
}

/**
 * Time on task. Correct answers cluster near the benchmark; misses split
 * into rushed guesses and time sinks, which is what the pacing view needs
 * to have anything to say.
 */
function timeFor(
  difficulty: Difficulty,
  correct: boolean,
  timed: boolean,
): number {
  const bench = TIME_BENCH[difficulty];
  if (correct) {
    const t = bench * (0.82 + 0.2 * gauss() * 0.5);
    return Math.max(18, Math.round(t * (timed ? 0.94 : 1.06)));
  }
  if (chance(0.34)) return Math.max(12, Math.round(bench * (0.22 + rng() * 0.26)));
  if (chance(0.42)) return Math.round(bench * (1.55 + rng() * 1.1));
  return Math.max(20, Math.round(bench * (0.85 + rng() * 0.5)));
}

function confidenceFor(correct: boolean, seconds: number, bench: number): Confidence {
  if (correct) {
    return weighted<Confidence>([
      ["lock", seconds < bench ? 62 : 34],
      ["lean", 34],
      ["guess", 6],
    ]);
  }
  return weighted<Confidence>([
    ["lock", 12],
    ["lean", 46],
    ["guess", seconds < bench * 0.5 ? 58 : 26],
  ]);
}

/** A wrong choice, biased toward the neighbours of the key (the way real
 *  near-miss arithmetic lands). */
function wrongIndex(correctIndex: number): number {
  const options: Array<[number, number]> = [];
  for (let i = 0; i < 5; i++) {
    if (i === correctIndex) continue;
    options.push([i, 4 - Math.abs(i - correctIndex)]);
  }
  return weighted(options);
}

const EDIT_JUSTIFICATIONS: Array<[string, string]> = [
  ["found_calc_error", "Re-ran the second step: 0.85 × 240 is 204, not 214."],
  ["found_calc_error", "Dropped a factor of 2 in the LCM; recomputed cleanly."],
  ["misread", "Question asked for the remainder, I solved for the quotient."],
  ["misread", "\"At least one\" — I computed exactly one."],
  ["new_solution_path", "Backsolving from choice C settles it in twenty seconds."],
  ["new_solution_path", "Weighted-average lever makes the ratio fall out directly."],
];

// ---------------------------------------------------------------------------

type QRow = {
  id: number;
  subtopic: string;
  fundamentalSkill: FundamentalSkill;
  difficulty: number;
  correctIndex: number;
};

async function main() {
  await ensureDbReady();

  const bank = (await db
    .select({
      id: questions.id,
      subtopic: questions.subtopic,
      fundamentalSkill: questions.fundamentalSkill,
      difficulty: questions.difficulty,
      correctIndex: questions.correctIndex,
    })
    .from(questions)
    .all()) as QRow[];

  if (bank.length === 0) {
    console.error("The question bank is empty — run `pnpm seed` first.");
    process.exit(1);
  }

  // --- idempotency guard --------------------------------------------------
  const existingSessions = await db.select().from(sessions).all();
  const syntheticIds = new Set(
    existingSessions
      .filter((s) => (s.config as { synthetic?: string })?.synthetic === SYNTHETIC_TAG)
      .map((s) => s.id),
  );
  const allAttempts = await db
    .select({ id: attempts.id, sessionId: attempts.sessionId })
    .from(attempts)
    .all();
  const realAttempts = allAttempts.filter(
    (a) => a.sessionId == null || !syntheticIds.has(a.sessionId),
  ).length;

  if (realAttempts > 0 && !FORCE) {
    console.error(
      [
        `Refusing to run: the database holds ${realAttempts} attempt(s) that this`,
        "script did not create. Wiping them would destroy a real training record.",
        "Back up first (`pnpm backup`), then rerun with --force if you are sure.",
      ].join("\n"),
    );
    process.exit(1);
  }

  // Regenerate from scratch so the result is a pure function of --seed.
  await db.delete(edits).run();
  await db.delete(redoQueue).run();
  await db.delete(deckReviews).run();
  await db.delete(questionFlags).run();
  await db.delete(attempts).run();
  await db.delete(sessions).run();
  await db.delete(patternAttempts).run();
  await db.delete(eloRatings).run();
  await db.delete(baselineReports).run();

  const bySkill = new Map<FundamentalSkill, QRow[]>();
  for (const skill of FUNDAMENTAL_SKILLS) bySkill.set(skill, []);
  for (const q of bank) bySkill.get(q.fundamentalSkill)?.push(q);

  const seenRecently = new Map<number, number>(); // questionId → day index used
  function drawQuestions(
    n: number,
    day: number,
    blend?: Array<[FundamentalSkill, number]>,
  ): QRow[] {
    const out: QRow[] = [];
    const taken = new Set<number>();
    const wanted: FundamentalSkill[] = [];
    if (blend) {
      for (const [skill, k] of blend) for (let i = 0; i < k; i++) wanted.push(skill);
    } else {
      // Weighted toward the weak skills, the way the plan would.
      for (let i = 0; i < n; i++) {
        wanted.push(
          weighted<FundamentalSkill>([
            ["rates_ratio_percent", 32],
            ["counting_sets_series_prob_stats", 26],
            ["equal_unequal_alg", 24],
            ["value_order_factors", 18],
          ]),
        );
      }
    }
    for (const skill of shuffle(wanted, rng).slice(0, n)) {
      const pool = (bySkill.get(skill) ?? []).filter(
        (q) => !taken.has(q.id) && (day - (seenRecently.get(q.id) ?? -99) > 9),
      );
      const source = pool.length > 0 ? pool : (bySkill.get(skill) ?? []).filter((q) => !taken.has(q.id));
      if (source.length === 0) continue;
      const q = source[Math.floor(rng() * source.length)];
      taken.add(q.id);
      seenRecently.set(q.id, day);
      out.push(q);
    }
    return out;
  }

  type AttemptRow = typeof attempts.$inferInsert;
  const attemptRows: AttemptRow[] = [];
  const editRows: Array<typeof edits.$inferInsert> = [];
  const sessionRows: Array<{
    focus: "focused" | "casual";
    row: typeof sessions.$inferInsert;
    items: Array<{ q: QRow; correct: boolean; seconds: number; conf: Confidence; when: Date; selected: number; errorType: ErrorType | null }>;
  }> = [];

  let totalAttempts = 0;
  let totalMisses = 0;

  /**
   * The spaced redo ladder, replayed as the days pass rather than patched
   * on afterwards — so "missed it, redid it at +2d, cleared it at +21d"
   * is a real chain in the data instead of a shape drawn over it.
   */
  const byId = new Map(bank.map((q) => [q.id, q]));
  type LadderItem = {
    sourceRef: number; // index into the flattened attempt list
    stage: 0 | 1 | 2;
    dueAt: number;
    cleared: boolean;
  };
  const ladder = new Map<number, LadderItem>();
  let flatIndex = 0;

  for (let back = DAYS - 1; back >= 0; back--) {
    const progress = (DAYS - 1 - back) / Math.max(1, DAYS - 1);
    // Rest days, and a two-day gap partway through so the volume chart is
    // not a flat wall.
    if (chance(0.14) || (back >= 22 && back <= 23)) continue;

    const dayPlans: Array<{
      mode: "drill" | "timed_set" | "redo";
      focus: "focused" | "casual";
      count: number;
      hour: number;
      blend?: Array<[FundamentalSkill, number]>;
      questionIds?: number[];
    }> = [];

    // Redo first: whatever the ladder says is due this morning, up to a
    // session's worth. The user is diligent but not perfect.
    // The redo block is the first thing in the day and the largest single
    // block: three clean passes per miss means throughput has to exceed
    // the miss rate several times over or the queue only ever grows.
    const dayStart = atDay(back, 7).getTime();
    const due = [...ladder.entries()]
      .filter(([, v]) => !v.cleared && v.dueAt <= dayStart)
      .sort((a, b) => a[1].dueAt - b[1].dueAt)
      .slice(0, randInt(rng, 14, 22));
    if (due.length > 0 && chance(0.88)) {
      dayPlans.push({
        mode: "redo",
        focus: "focused",
        count: due.length,
        hour: randInt(rng, 7, 9),
        questionIds: due.map(([id]) => id),
      });
    }

    const isTimedDay = back % 3 === 0 && back < DAYS - 3;
    if (isTimedDay) {
      dayPlans.push({
        mode: "timed_set",
        focus: "focused",
        count: 21,
        hour: randInt(rng, 9, 11),
        blend: [
          ["value_order_factors", 6],
          ["equal_unequal_alg", 6],
          ["rates_ratio_percent", 5],
          ["counting_sets_series_prob_stats", 4],
        ],
      });
    }
    dayPlans.push({
      mode: "drill",
      focus: "focused",
      count: randInt(rng, 8, isTimedDay ? 10 : 16),
      hour: randInt(rng, 17, 21),
    });
    if (chance(0.22)) {
      dayPlans.push({
        mode: "drill",
        focus: "casual",
        count: randInt(rng, 4, 7),
        hour: randInt(rng, 12, 14),
      });
    }

    for (const planned of dayPlans) {
      const picked = planned.questionIds
        ? planned.questionIds
            .map((id) => byId.get(id))
            .filter((q): q is QRow => q != null)
        : drawQuestions(planned.count, back, planned.blend);
      if (picked.length === 0) continue;
      const startedAt = atDay(back, planned.hour);
      const items: Array<{
        q: QRow;
        correct: boolean;
        seconds: number;
        conf: Confidence;
        when: Date;
        selected: number;
        errorType: ErrorType | null;
      }> = [];
      let cursor = startedAt.getTime();

      picked.forEach((q, i) => {
        const difficulty = q.difficulty as Difficulty;
        let p = accuracyFor(q.fundamentalSkill, difficulty, progress);
        // Casual sessions are lower-stakes and a little sloppier.
        if (planned.focus === "casual") p -= 0.06;
        // Late in a 21-question timed set, fatigue and clock pressure bite.
        if (planned.mode === "timed_set" && i >= 15) p -= 0.08;
        // A redo is a second look at a question already dissected once.
        if (planned.mode === "redo") {
          const stage = ladder.get(q.id)?.stage ?? 0;
          p = Math.min(0.96, p + [0.26, 0.2, 0.13][stage]);
        }
        const correct = chance(p);
        const seconds = timeFor(difficulty, correct, planned.mode === "timed_set");
        const conf = confidenceFor(correct, seconds, TIME_BENCH[difficulty]);
        cursor += (seconds + randInt(rng, 3, 25)) * 1000;
        let errorType: ErrorType | null = null;
        if (!correct) {
          if (conf === "guess" && chance(0.7)) errorType = "guess";
          else if (seconds > TIME_BENCH[difficulty] * 1.5 && chance(0.55))
            errorType = "time_pressure";
          else errorType = chance(0.88) ? weighted(ERROR_MIX) : null;
        }
        items.push({
          q,
          correct,
          seconds,
          conf,
          when: new Date(cursor),
          selected: correct ? q.correctIndex : wrongIndex(q.correctIndex),
          errorType,
        });
      });

      // Yesterday's evening drill is left unfinished on purpose: real
      // runs get abandoned, and the resume path needs something to
      // resume. The session keeps its full question list in config and
      // never gets an ended_at, which is exactly what lib/resume.ts
      // looks for.
      const abandoned =
        back === 1 && planned.mode === "drill" && planned.focus === "focused";
      const keptItems = abandoned
        ? items.slice(0, Math.max(1, Math.floor(items.length * 0.4)))
        : items;

      // Advance the ladder exactly the way lib/redo.ts does, including the
      // day-21 cold-solve gate (correct AND within 2:30, else back to +7d).
      keptItems.forEach((it, i) => {
        const ref = flatIndex + i;
        const open = ladder.get(it.q.id);
        if (planned.mode === "redo" && open && !open.cleared) {
          if (!it.correct) {
            ladder.set(it.q.id, { ...open, stage: 0, dueAt: it.when.getTime() + 2 * DAY_MS });
          } else if (open.stage === 0) {
            ladder.set(it.q.id, { ...open, stage: 1, dueAt: it.when.getTime() + 7 * DAY_MS });
          } else if (open.stage === 1) {
            ladder.set(it.q.id, { ...open, stage: 2, dueAt: it.when.getTime() + 21 * DAY_MS });
          } else if (it.seconds <= COLD_SOLVE_LIMIT_SECONDS) {
            ladder.set(it.q.id, { ...open, cleared: true });
          } else {
            ladder.set(it.q.id, { ...open, stage: 1, dueAt: it.when.getTime() + 7 * DAY_MS });
          }
          return;
        }
        if (!it.correct && planned.focus !== "casual") {
          // A fresh miss enqueues at stage 0; missing a queued question
          // again resets it to stage 0 without losing its origin.
          ladder.set(it.q.id, {
            sourceRef: open && !open.cleared ? open.sourceRef : ref,
            stage: 0,
            dueAt: it.when.getTime() + 2 * DAY_MS,
            cleared: false,
          });
        }
      });
      flatIndex += keptItems.length;

      const correctCount = keptItems.filter((it) => it.correct).length;
      sessionRows.push({
        focus: planned.focus,
        row: {
          mode: planned.mode,
          config: {
            synthetic: SYNTHETIC_TAG,
            focus: planned.focus,
            count: items.length,
            questionIds: picked.map((q) => q.id),
            ...(planned.mode === "timed_set" ? { total: 21, minutes: 45 } : {}),
          } as unknown as Record<string, unknown>,
          startedAt,
          endedAt: abandoned ? null : new Date(cursor),
          summary: abandoned
            ? null
            : ({
                correct: correctCount,
                total: keptItems.length,
              } as unknown as Record<string, unknown>),
        } as typeof sessions.$inferInsert,
        items: keptItems,
      });
      totalAttempts += keptItems.length;
      totalMisses += keptItems.length - correctCount;
    }
  }

  // --- write sessions + attempts (+ the Review & Edit ledger) -------------
  for (const { row, items, focus } of sessionRows) {
    const session = await db.insert(sessions).values(row).returning().get();
    const mode = row.mode as "drill" | "timed_set" | "redo";
    for (const it of items) {
      attemptRows.push({
        questionId: it.q.id,
        sessionId: session.id,
        mode,
        focus,
        selectedIndex: it.selected,
        correct: it.correct,
        timeSeconds: it.seconds,
        confidence: it.conf,
        errorType: it.errorType,
        createdAt: it.when,
      });
    }
    // Review & Edit: a couple of changed answers per timed section, with
    // the honest mix — some rescued, some destroyed, some neutral.
    if (mode === "timed_set") {
      const candidates = shuffle(items, rng).slice(0, randInt(rng, 1, 3));
      for (const it of candidates) {
        const [reason, justification] = pick(rng, EDIT_JUSTIFICATIONS);
        const fromCorrect = it.correct ? chance(0.35) : false;
        const toCorrect = it.correct ? true : chance(0.45);
        if (fromCorrect === toCorrect && it.correct) continue;
        editRows.push({
          sessionId: session.id,
          questionId: it.q.id,
          fromIndex: fromCorrect ? it.q.correctIndex : wrongIndex(it.q.correctIndex),
          toIndex: toCorrect ? it.q.correctIndex : wrongIndex(it.q.correctIndex),
          fromCorrect,
          toCorrect,
          reason: reason as "found_calc_error" | "misread" | "new_solution_path",
          justification,
          createdAt: new Date(it.when.getTime() + 60_000),
        });
      }
    }
  }

  for (let i = 0; i < attemptRows.length; i += 200) {
    await db.insert(attempts).values(attemptRows.slice(i, i + 200)).run();
  }
  if (editRows.length > 0) await db.insert(edits).values(editRows).run();

  // --- redo queue: the ladder built during the day loop ------------------
  // attempts were inserted into an empty table in flat order, so row ids
  // ascend in that same order and resolve every sourceRef.
  const insertedIds = (
    await db.select({ id: attempts.id }).from(attempts).orderBy(sql`id asc`).all()
  ).map((r) => r.id);
  const redoRows = [...ladder.entries()].map(([questionId, s]) => ({
    questionId,
    sourceAttemptId: insertedIds[s.sourceRef],
    stage: s.stage,
    dueAt: new Date(s.dueAt),
    cleared: s.cleared,
  }));
  for (let i = 0; i < redoRows.length; i += 200) {
    await db.insert(redoQueue).values(redoRows.slice(i, i + 200)).run();
  }

  // --- deck scheduling: grade the older cards, leave recent misses new ----
  const missedQuestionIds = [
    ...new Set(
      attemptRows.filter((r) => !r.correct && r.focus !== "casual").map((r) => r.questionId),
    ),
  ];
  const graded = missedQuestionIds.slice(0, Math.floor(missedQuestionIds.length * 0.55));
  const deckRows: Array<typeof deckReviews.$inferInsert> = [];
  for (const questionId of graded) {
    let state: ReviewState | null = null;
    const reps = randInt(rng, 1, 4);
    for (let i = 0; i < reps; i++) {
      const grade = weighted<ReviewGrade>([
        ["good", 62],
        ["hard", 26],
        ["forgot", 12],
      ]);
      state = nextReview(state, grade);
    }
    if (!state) continue;
    // Spread due dates: some overdue, some today, most ahead.
    const offsetDays = weighted<number>([
      [-randInt(rng, 1, 4), 22],
      [0, 18],
      [randInt(rng, 1, state.intervalDays + 2), 60],
    ]);
    deckRows.push({
      questionId,
      ease: state.ease,
      intervalDays: state.intervalDays,
      reps: state.reps,
      lapses: state.lapses,
      dueAt: new Date(Date.now() + offsetDays * DAY_MS),
      updatedAt: new Date(Date.now() - randInt(rng, 1, 10) * DAY_MS),
    });
  }
  for (let i = 0; i < deckRows.length; i += 200) {
    await db.insert(deckReviews).values(deckRows.slice(i, i + 200)).run();
  }

  // --- pattern trainer: rounds over the window, ELO replayed honestly ----
  const patternRows: Array<typeof patternAttempts.$inferInsert> = [];
  const elo: Record<string, number> = {};
  for (const key of PATTERN_CATEGORY_KEYS) elo[key] = ELO_START;
  // Item difficulty the trainer plays against, per category.
  const ITEM_RATING = 1250;
  for (let back = DAYS - 1; back >= 0; back--) {
    if (chance(0.35)) continue;
    const progress = (DAYS - 1 - back) / Math.max(1, DAYS - 1);
    const categories = shuffle([...PATTERN_CATEGORY_KEYS], rng).slice(0, randInt(rng, 1, 3));
    for (const category of categories) {
      const base =
        category === "trailing_zeros_factorials" || category === "factor_counts"
          ? 0.5
          : category === "must_be_true_snap"
            ? 0.55
            : 0.66;
      const p = Math.min(0.95, base + 0.22 * progress);
      const roundStart = atDay(back, randInt(rng, 7, 22)).getTime();
      let cursor = roundStart;
      for (let i = 0; i < 12; i++) {
        const correct = chance(p);
        const ms = Math.max(
          900,
          Math.round((correct ? 3400 : 6200) * (0.6 + rng() * 0.9)),
        );
        cursor += ms + 400;
        elo[category] = nextRating(elo[category], ITEM_RATING, correct);
        patternRows.push({
          category,
          promptText: `${category} · item ${i + 1}`,
          correctAnswer: "—",
          userAnswer: correct ? "—" : "×",
          ms,
          correct,
          createdAt: new Date(cursor),
        });
      }
      await db
        .insert(sessions)
        .values({
          mode: "pattern",
          config: { synthetic: SYNTHETIC_TAG, category } as unknown as Record<string, unknown>,
          startedAt: new Date(roundStart),
          endedAt: new Date(cursor),
          summary: { category, score: patternRows.slice(-12).filter((r) => r.correct).length, total: 12 } as unknown as Record<string, unknown>,
        })
        .run();
    }
  }
  for (let i = 0; i < patternRows.length; i += 400) {
    await db.insert(patternAttempts).values(patternRows.slice(i, i + 400)).run();
  }
  for (const key of PATTERN_CATEGORY_KEYS) {
    await db
      .insert(eloRatings)
      .values({ category: key, rating: elo[key], updatedAt: new Date() })
      .onConflictDoUpdate({
        target: eloRatings.category,
        set: { rating: elo[key], updatedAt: new Date() },
      })
      .run();
  }

  // --- one imported official score report --------------------------------
  const reportedAt = atDay(DAYS - 4, 11);
  const parsed = {
    test_date: reportedAt.toISOString().slice(0, 10),
    total_score: 605,
    sections: [
      { section: "quant", scaled_score: 79, percentile: 61 },
      { section: "verbal", scaled_score: 82, percentile: 78 },
      { section: "data_insights", scaled_score: 77, percentile: 63 },
    ],
    fundamental_skills: [
      { skill: "value_order_factors", percentile: 68 },
      { skill: "equal_unequal_alg", percentile: 54 },
      { skill: "rates_ratio_percent", percentile: 37 },
      { skill: "counting_sets_series_prob_stats", percentile: 46 },
    ],
    content_domains: [
      { domain: "arithmetic", percentile: 58 },
      { domain: "algebra", percentile: 49 },
    ],
    contexts: [
      { context: "pure", percentile: 61 },
      { context: "real", percentile: 44 },
    ],
    per_question_rows: Array.from({ length: 21 }, (_, i) => ({
      number: i + 1,
      time_minutes: Math.round((1.2 + rng() * 1.9) * 10) / 10,
      result: chance(0.62) ? "correct" : "incorrect",
    })),
  };
  await db
    .insert(baselineReports)
    .values({
      rawText:
        "SYNTHETIC development fixture — not a real GMAC score report. Generated by scripts/dev-seed-history.ts.",
      parsed: parsed as unknown as Record<string, unknown>,
      createdAt: reportedAt,
    })
    .run();

  // --- a couple of open content flags ------------------------------------
  const flagged = shuffle(bank, rng).slice(0, 2);
  for (const q of flagged) {
    await db
      .insert(questionFlags)
      .values({
        questionId: q.id,
        reason: pick(rng, ["ambiguous", "typo"] as const),
        note: "Synthetic development fixture.",
        createdAt: atDay(randInt(rng, 1, 12), 19),
      })
      .run();
  }

  // --- settings: a test date that puts the plan in the Accuracy phase ----
  const testDate = new Date(Date.now() + 38 * DAY_MS);
  const iso = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, "0")}-${String(testDate.getDate()).padStart(2, "0")}`;
  for (const [key, value] of [
    ["test_date", iso],
    ["timed_set_cadence", "3"],
  ] as const) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
      .run();
  }

  console.log(
    [
      `✓ synthetic history seeded (seed ${SEED}, ${DAYS} days)`,
      `  sessions      ${sessionRows.length} study + pattern rounds`,
      `  attempts      ${totalAttempts} (${totalMisses} misses)`,
      `  edits         ${editRows.length}`,
      `  redo queue    ${redoRows.length} rows (${redoRows.filter((r) => !r.cleared && r.dueAt.getTime() <= Date.now()).length} due now)`,
      `  deck reviews  ${deckRows.length}`,
      `  pattern       ${patternRows.length} items across ${PATTERN_CATEGORY_KEYS.length} categories`,
      `  test date     ${iso}`,
      "",
      "DEVELOPMENT DATA ONLY — run `pnpm seed` on a clean database to reset.",
    ].join("\n"),
  );
}

await main();
