import { desc, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  edits,
  eloRatings,
  questions,
  redoQueue,
} from "./db/schema.ts";
import { ELO_START } from "./elo.ts";
import { gatherDiscipline, type DisciplineData } from "./discipline-server.ts";
import {
  topMechanisms,
  weeklyErrorRates,
  type ErrorWeek,
} from "./forensics.ts";
import { dayIndex, dayKey, keyFromDayIndex, shortLabelFromKey } from "./local-day.ts";
import {
  gatherLongitudinal,
  type LongitudinalData,
} from "./longitudinal-server.ts";
import { readinessRead, type ReadinessData } from "./readiness.ts";
import { appTimeZone } from "./settings.ts";
import {
  PATTERN_CATEGORY_KEYS,
  PATTERN_CATEGORY_LABELS,
  type PatternCategoryKey,
} from "./generators/index.ts";
import {
  ALL_SUBTOPICS,
  CONFIDENCES,
  CONTENT_DOMAINS,
  CONTEXTS,
  CONTEXT_LABELS,
  DOMAIN_LABELS,
  ERROR_TYPES,
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  type Confidence,
  type ErrorType,
  type Subtopic,
} from "./taxonomy.ts";

export type MirrorBar = { key: string; label: string; correct: number; total: number };

export type ScatterPoint = {
  time: number;
  difficulty: number;
  correct: boolean;
};

export type TrendPoint = {
  date: string;
  rates_ratio_percent: number | null;
  value_order_factors: number | null;
  equal_unequal_alg: number | null;
  counting_sets_series_prob_stats: number | null;
};

export type EditLedgerRow = {
  id: number;
  createdAt: Date;
  subtopic: Subtopic;
  fromCorrect: boolean;
  toCorrect: boolean;
  reason: string;
  justification: string;
};

export type DifficultyMatrixRow = {
  subtopic: Subtopic;
  cells: Record<number, { correct: number; total: number }>;
};

export type VolumeDay = { date: string; count: number };

export type AnalyticsData = {
  attemptCount: number;
  /** Attempts tagged casual at session start, excluded from every number here. */
  casualExcluded: number;
  mirror: {
    domains: MirrorBar[];
    contexts: MirrorBar[];
    skills: MirrorBar[];
  };
  heatmap: {
    rows: Array<{
      subtopic: Subtopic;
      counts: Record<ErrorType, number>;
      total: number;
    }>;
    max: number;
  };
  /** Second heatmap keyed on attempts.error_subtag — the subtopic that
   *  actually failed, which may differ from the question's own. */
  subtagHeatmap: {
    rows: Array<{
      subtopic: Subtopic;
      counts: Record<ErrorType, number>;
      total: number;
      /** How many of these failures came from questions filed under a
       *  different chapter. */
      crossTopic: number;
    }>;
    max: number;
  };
  /** Recent question ids per error mechanism — the slip sites, ready to
   *  reassemble as a drill. */
  slipSites: Partial<Record<ErrorType, number[]>>;
  /** Weekly recurrence per error mechanism (lib/forensics.ts). */
  errorTrend: { weeks: ErrorWeek[]; top: ErrorType[] };
  scatter: ScatterPoint[];
  zones: { over245: number; sub60Wrong: number; luckyCorrect: number };
  editLedger: {
    lifetimeNet: number;
    total: number;
    improved: number;
    destroyed: number;
    neutral: number;
    lockCorrectChanged: number;
    rows: EditLedgerRow[];
  };
  calibration: Array<{
    confidence: Confidence;
    expected: number;
    actual: number | null;
    total: number;
  }>;
  trend: TrendPoint[];
  /** Accuracy per subtopic × difficulty (focused attempts only). */
  difficultyMatrix: DifficultyMatrixRow[];
  /** Attempts per local day, most recent 84 days (includes zero days). */
  volume: VolumeDay[];
  redoCompliance: {
    open: number;
    overdue: number;
    cleared: number;
    dueNow: number;
  };
  eloBars: Array<{ category: PatternCategoryKey; label: string; rating: number }>;
  /** Triage discipline: sunk costs vs your own record (lib/discipline.ts). */
  discipline: DisciplineData;
  /** Section replay, weekly pacing, edit-net trend (lib/longitudinal.ts). */
  longitudinal: LongitudinalData;
  /** What's still leaking points, anchored to official scores. */
  readiness: ReadinessData;
  /** Twin lineage: original vs twin performance, when twins exist. */
  twins: {
    pairs: number;
    originals: { correct: number; total: number };
    twins: { correct: number; total: number };
  } | null;
};

/** Expected accuracy per confidence bucket for the calibration curve. */
const EXPECTED_BY_CONFIDENCE: Record<Confidence, number> = {
  guess: 20,
  lean: 70,
  lock: 95,
};

export async function gatherAnalytics(): Promise<AnalyticsData> {
  const tz = await appTimeZone();
  const rows = await db
    .select({
      id: attempts.id,
      questionId: attempts.questionId,
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      confidence: attempts.confidence,
      errorType: attempts.errorType,
      errorSubtag: attempts.errorSubtag,
      createdAt: attempts.createdAt,
      subtopic: questions.subtopic,
      skill: questions.fundamentalSkill,
      domain: questions.contentDomain,
      context: questions.context,
      difficulty: questions.difficulty,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.focus, "focused"))
    .orderBy(desc(attempts.id))
    .limit(5000)
    .all();

  // Casual attempts and their sessions stay out of every statistic below.
  const casualRows = await db
    .select({ sessionId: attempts.sessionId })
    .from(attempts)
    .where(eq(attempts.focus, "casual"))
    .all();
  const casualExcluded = casualRows.length;
  const casualSessionIds = new Set(
    casualRows.map((r) => r.sessionId).filter((s): s is number => s != null),
  );

  // --- score-report mirror -------------------------------------------------
  function bars<K extends string>(
    keys: readonly K[],
    labels: Record<K, string>,
    of: (row: (typeof rows)[number]) => K,
  ): MirrorBar[] {
    return keys.map((key) => {
      const subset = rows.filter((r) => of(r) === key);
      return {
        key,
        label: labels[key],
        correct: subset.filter((r) => r.correct).length,
        total: subset.length,
      };
    });
  }

  // --- heatmap: subtopic × error type (wrong, classified attempts) ---------
  const heatRows = ALL_SUBTOPICS.map((subtopic) => {
    const counts = {} as Record<ErrorType, number>;
    for (const et of ERROR_TYPES) counts[et] = 0;
    let total = 0;
    for (const r of rows) {
      if (r.subtopic !== subtopic || r.correct || !r.errorType) continue;
      counts[r.errorType]++;
      total++;
    }
    return { subtopic, counts, total };
  }).filter((r) => r.total > 0);
  const heatMax = heatRows.reduce(
    (m, r) => Math.max(m, ...ERROR_TYPES.map((et) => r.counts[et])),
    0,
  );

  // --- subtag heatmap: the subtopic that actually failed -------------------
  const subtagRows = ALL_SUBTOPICS.map((subtopic) => {
    const counts = {} as Record<ErrorType, number>;
    for (const et of ERROR_TYPES) counts[et] = 0;
    let total = 0;
    let crossTopic = 0;
    for (const r of rows) {
      if (r.errorSubtag !== subtopic || r.correct || !r.errorType) continue;
      counts[r.errorType]++;
      total++;
      if (r.subtopic !== subtopic) crossTopic++;
    }
    return { subtopic, counts, total, crossTopic };
  }).filter((r) => r.total > 0);
  const subtagMax = subtagRows.reduce(
    (m, r) => Math.max(m, ...ERROR_TYPES.map((et) => r.counts[et])),
    0,
  );

  // --- slip sites: recent distinct questions per error mechanism -----------
  const slipSites: Partial<Record<ErrorType, number[]>> = {};
  for (const r of rows) {
    if (r.correct || !r.errorType) continue;
    const list = slipSites[r.errorType] ?? [];
    if (list.length < 10 && !list.includes(r.questionId)) {
      list.push(r.questionId);
      slipSites[r.errorType] = list;
    }
  }

  // --- scatter + zones ------------------------------------------------------
  const scatter = rows.slice(0, 800).map((r) => ({
    time: Math.round(r.timeSeconds * 10) / 10,
    difficulty: r.difficulty,
    correct: r.correct,
  }));
  const zones = {
    over245: rows.filter((r) => r.timeSeconds > 165).length,
    sub60Wrong: rows.filter((r) => r.timeSeconds < 60 && !r.correct).length,
    luckyCorrect: rows.filter((r) => r.correct && r.confidence === "guess")
      .length,
  };

  // --- edit ledger ----------------------------------------------------------
  const editRows = (
    await db
      .select({
        id: edits.id,
        createdAt: edits.createdAt,
        fromCorrect: edits.fromCorrect,
        toCorrect: edits.toCorrect,
        reason: edits.reason,
        justification: edits.justification,
        sessionId: edits.sessionId,
        questionId: edits.questionId,
        subtopic: questions.subtopic,
      })
      .from(edits)
      .innerJoin(questions, eq(edits.questionId, questions.id))
      .orderBy(desc(edits.id))
      .all()
  ).filter((e) => !casualSessionIds.has(e.sessionId));

  const improved = editRows.filter((e) => !e.fromCorrect && e.toCorrect).length;
  const destroyed = editRows.filter((e) => e.fromCorrect && !e.toCorrect).length;

  // Lock-confidence answers that were correct and then changed. Only the
  // edited sessions' attempts matter; on a repeat attempt of the same
  // question in one session the latest attempt wins, deterministically.
  const editSessionIds = [...new Set(editRows.map((e) => e.sessionId))];
  const attemptConfidence = editSessionIds.length
    ? await db
        .select({
          id: attempts.id,
          sessionId: attempts.sessionId,
          questionId: attempts.questionId,
          confidence: attempts.confidence,
        })
        .from(attempts)
        .where(inArray(attempts.sessionId, editSessionIds))
        .all()
    : [];
  const confidenceByKey = new Map<string, Confidence>();
  for (const a of [...attemptConfidence].sort((x, y) => x.id - y.id)) {
    confidenceByKey.set(`${a.sessionId}|${a.questionId}`, a.confidence);
  }
  const lockCorrectChanged = editRows.filter(
    (e) =>
      e.fromCorrect &&
      confidenceByKey.get(`${e.sessionId}|${e.questionId}`) === "lock",
  ).length;

  // --- calibration -----------------------------------------------------------
  const calibration = CONFIDENCES.map((confidence) => {
    const subset = rows.filter((r) => r.confidence === confidence);
    return {
      confidence,
      expected: EXPECTED_BY_CONFIDENCE[confidence],
      actual:
        subset.length > 0
          ? Math.round(
              (subset.filter((r) => r.correct).length / subset.length) * 100,
            )
          : null,
      total: subset.length,
    };
  });

  // --- rolling 7-day accuracy per skill, last 30 days -------------------------
  // Day boundaries follow the user's timezone; each row's local day is
  // computed once and windows compare whole days.
  const rowDayIdx = rows.map((r) => dayIndex(new Date(r.createdAt), tz));
  const todayIdx = dayIndex(new Date(), tz);
  const trend: TrendPoint[] = [];
  for (let back = 29; back >= 0; back--) {
    const idx = todayIdx - back;
    const point: TrendPoint = {
      date: shortLabelFromKey(keyFromDayIndex(idx)),
      rates_ratio_percent: null,
      value_order_factors: null,
      equal_unequal_alg: null,
      counting_sets_series_prob_stats: null,
    };
    for (const skill of FUNDAMENTAL_SKILLS) {
      let correct = 0;
      let total = 0;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].skill !== skill) continue;
        if (rowDayIdx[i] <= idx - 7 || rowDayIdx[i] > idx) continue;
        total++;
        if (rows[i].correct) correct++;
      }
      if (total > 0) point[skill] = Math.round((correct / total) * 100);
    }
    trend.push(point);
  }

  // --- accuracy × difficulty matrix -----------------------------------------
  const difficultyMatrix: DifficultyMatrixRow[] = ALL_SUBTOPICS.map(
    (subtopic) => {
      const cells: Record<number, { correct: number; total: number }> = {};
      for (const d of [2, 3, 4, 5]) cells[d] = { correct: 0, total: 0 };
      for (const r of rows) {
        if (r.subtopic !== subtopic || cells[r.difficulty] == null) continue;
        cells[r.difficulty].total++;
        if (r.correct) cells[r.difficulty].correct++;
      }
      return { subtopic, cells };
    },
  ).filter((row) => Object.values(row.cells).some((c) => c.total > 0));

  // --- training volume, last 84 local days -----------------------------------
  const volume: VolumeDay[] = [];
  {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const key = dayKey(new Date(r.createdAt), tz);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (let back = 83; back >= 0; back--) {
      const key = keyFromDayIndex(todayIdx - back);
      volume.push({ date: key, count: counts.get(key) ?? 0 });
    }
  }

  // --- redo compliance ---------------------------------------------------------
  const redoRows = await db.select().from(redoQueue).all();
  const nowMs = Date.now();
  const redoCompliance = {
    open: redoRows.filter((r) => !r.cleared).length,
    overdue: redoRows.filter(
      (r) => !r.cleared && new Date(r.dueAt).getTime() < nowMs,
    ).length,
    cleared: redoRows.filter((r) => r.cleared).length,
    dueNow: redoRows.filter(
      (r) => !r.cleared && new Date(r.dueAt).getTime() <= nowMs,
    ).length,
  };

  // --- pattern ELO ---------------------------------------------------------------
  const eloMap = new Map(
    (await db.select().from(eloRatings).all()).map((r) => [
      r.category,
      r.rating,
    ]),
  );
  const eloBars = PATTERN_CATEGORY_KEYS.map((category) => ({
    category,
    label: PATTERN_CATEGORY_LABELS[category],
    rating: Math.round(eloMap.get(category) ?? ELO_START),
  }));

  // --- error-mechanism recurrence, weekly ------------------------------------
  const errorWeeks = weeklyErrorRates(
    rows.map((r, i) => ({
      dayIdx: rowDayIdx[i],
      correct: r.correct,
      errorType: r.errorType,
    })),
    todayIdx,
    keyFromDayIndex,
  );

  // --- twin lineage -----------------------------------------------------------
  const twinRows = await db
    .select({ id: questions.id, twinOf: questions.twinOf })
    .from(questions)
    .all();
  const twinIds = new Set(
    twinRows.filter((q) => q.twinOf != null).map((q) => q.id),
  );
  const originalIds = new Set(
    twinRows
      .map((q) => q.twinOf)
      .filter((id): id is number => id != null),
  );
  let twins: AnalyticsData["twins"] = null;
  if (twinIds.size > 0) {
    const t = { correct: 0, total: 0 };
    const o = { correct: 0, total: 0 };
    for (const r of rows) {
      if (twinIds.has(r.questionId)) {
        t.total++;
        if (r.correct) t.correct++;
      } else if (originalIds.has(r.questionId)) {
        o.total++;
        if (r.correct) o.correct++;
      }
    }
    twins = { pairs: twinIds.size, originals: o, twins: t };
  }

  const discipline = await gatherDiscipline();
  const longitudinal = await gatherLongitudinal(tz);
  const readiness = readinessRead({
    series: longitudinal.scoreSeries,
    disciplineWeeks: discipline.weekly,
    errorWeeks,
    pacingWeeks: longitudinal.pacingWeeks,
    editWeeks: longitudinal.editWeeks,
  });

  return {
    attemptCount: rows.length,
    casualExcluded,
    mirror: {
      domains: bars(CONTENT_DOMAINS, DOMAIN_LABELS, (r) => r.domain),
      contexts: bars(CONTEXTS, CONTEXT_LABELS, (r) => r.context),
      skills: bars(FUNDAMENTAL_SKILLS, SKILL_LABELS, (r) => r.skill),
    },
    heatmap: { rows: heatRows, max: heatMax },
    subtagHeatmap: { rows: subtagRows, max: subtagMax },
    slipSites,
    errorTrend: { weeks: errorWeeks, top: topMechanisms(errorWeeks) },
    scatter,
    zones,
    editLedger: {
      lifetimeNet: improved - destroyed,
      total: editRows.length,
      improved,
      destroyed,
      neutral: editRows.length - improved - destroyed,
      lockCorrectChanged,
      rows: editRows.map((e) => ({
        id: e.id,
        createdAt: e.createdAt,
        subtopic: e.subtopic,
        fromCorrect: e.fromCorrect,
        toCorrect: e.toCorrect,
        reason: e.reason,
        justification: e.justification,
      })),
    },
    calibration,
    trend,
    difficultyMatrix,
    volume,
    redoCompliance,
    eloBars,
    discipline,
    longitudinal,
    readiness,
    twins,
  };
}
