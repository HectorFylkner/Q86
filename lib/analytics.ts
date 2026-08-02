import { count as sqlCount, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  baselineReports,
  edits,
  eloRatings,
  patternAttempts,
  questions,
  redoQueue,
} from "./db/schema.ts";
import { ELO_START, nextRating } from "./elo.ts";
import {
  PATTERN_CATEGORY_KEYS,
  PATTERN_CATEGORY_LABELS,
  type PatternCategoryKey,
} from "./generators/index.ts";
import {
  accuracyPct,
  bucketByTime,
  calibration as calibrationRows,
  calibrationError,
  median,
  type TimeBucketEdge,
} from "./analytics-math.ts";
import { recentMissChains, type MissChainSummary } from "./miss-chain.ts";
import { RUSH_RATIO, SINK_RATIO, TIME_BENCH } from "./pacing.ts";
import {
  ALL_SUBTOPICS,
  CONFIDENCES,
  CONTENT_DOMAINS,
  CONTEXTS,
  CONTEXT_LABELS,
  DOMAIN_LABELS,
  ERROR_TYPES,
  FUNDAMENTAL_SKILLS,
  QUANT_FORMATS,
  SKILL_BY_SUBTOPIC,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
  type Confidence,
  type Difficulty,
  type ErrorType,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

/** 21 questions in 45 minutes — the official Quant section average. */
export const SECTION_BUDGET_SECONDS = Math.round((45 * 60) / 21);

/** The difficulty rungs the mastery grid shows (D1 is not in the bank). */
const MASTERY_BANDS = [2, 3, 4, 5];

/** Item rating the pattern trainer plays against, mirroring the runner. */
const ELO_ITEM_RATING = 1250;

const SECTION_REPORT_LABELS: Record<string, string> = {
  quant: "Quantitative Reasoning",
  verbal: "Verbal Reasoning",
  data_insights: "Data Insights",
};

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

/** One cell of the 24-subtopic mastery grid. */
export type MasteryCell = {
  difficulty: number;
  correct: number;
  total: number;
  /** Verified bank items available in this cell. */
  available: number;
};

export type MasteryGridRow = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  label: string;
  cells: MasteryCell[];
  /** Focused attempts across the row. */
  total: number;
  correct: number;
};

/** Time-on-task against the section budget. */
export type PacingPoint = {
  seconds: number;
  difficulty: number;
  correct: boolean;
  /** Benchmark for this difficulty, from lib/pacing.ts. */
  bench: number;
};

export type PacingBucket = {
  /** Inclusive lower bound in seconds; the last bucket is open-ended. */
  from: number;
  to: number | null;
  label: string;
  correct: number;
  total: number;
};

export type PacingView = {
  points: PacingPoint[];
  buckets: PacingBucket[];
  /** The official section average: 21 questions in 45 minutes. */
  budgetSeconds: number;
  medianSeconds: number | null;
  /** Answered wrong in under half the benchmark. */
  rushedWrong: number;
  /** Ran more than half again over the benchmark. */
  timeSinks: number;
  /** Seconds spent beyond benchmark on sinks — the recoverable time. */
  sinkOverspendSeconds: number;
};

export type EloTrajectoryPoint = { n: number; rating: number };

export type EloTrajectory = {
  category: PatternCategoryKey;
  label: string;
  points: EloTrajectoryPoint[];
  current: number;
  /** Change over the plotted window. */
  delta: number;
};

/** The imported report beside the platform's own numbers, same cuts. */
export type MirrorPair = {
  key: string;
  label: string;
  /** Percentile from the imported official report, when present. */
  reported: number | null;
  /** Platform accuracy over Quant-format items, 0..100. */
  platform: number | null;
  platformTotal: number;
};

export type ScoreReportMirror = {
  reportedAt: Date | null;
  totalScore: number | null;
  sections: Array<{
    section: string;
    label: string;
    scaledScore: number | null;
    percentile: number | null;
  }>;
  skills: MirrorPair[];
  domains: MirrorPair[];
  contexts: MirrorPair[];
  /** Attempts excluded from the Quant read because DS is a Data Insights
   *  format on the Focus Edition (see SECTION_BY_FORMAT). */
  dataInsightsExcluded: number;
};

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
  scatter: ScatterPoint[];
  zones: { over245: number; sub60Wrong: number };
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
    /** expected − actual, in points. Positive is overconfidence. */
    gap: number | null;
  }>;
  /** Attempt-weighted mean absolute calibration gap, in points. */
  calibrationMeanError: number | null;
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
  masteryGrid: MasteryGridRow[];
  pacing: PacingView;
  eloTrajectories: EloTrajectory[];
  reportMirror: ScoreReportMirror;
  missChains: MissChainSummary;
};

/** Expected accuracy per confidence bucket for the calibration curve. */
const EXPECTED_BY_CONFIDENCE: Record<Confidence, number> = {
  guess: 20,
  lean: 70,
  lock: 95,
};

export async function gatherAnalytics(): Promise<AnalyticsData> {
  const rows = await db
    .select({
      id: attempts.id,
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      confidence: attempts.confidence,
      errorType: attempts.errorType,
      createdAt: attempts.createdAt,
      subtopic: questions.subtopic,
      skill: questions.fundamentalSkill,
      domain: questions.contentDomain,
      context: questions.context,
      difficulty: questions.difficulty,
      format: questions.format,
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

  // --- scatter + zones ------------------------------------------------------
  const scatter = rows.slice(0, 800).map((r) => ({
    time: Math.round(r.timeSeconds * 10) / 10,
    difficulty: r.difficulty,
    correct: r.correct,
  }));
  const zones = {
    over245: rows.filter((r) => r.timeSeconds > 165).length,
    sub60Wrong: rows.filter((r) => r.timeSeconds < 60 && !r.correct).length,
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

  // Lock-confidence answers that were correct and then changed.
  const attemptConfidence = await db
    .select({
      sessionId: attempts.sessionId,
      questionId: attempts.questionId,
      confidence: attempts.confidence,
    })
    .from(attempts)
    .all();
  const confidenceByKey = new Map(
    attemptConfidence.map((a) => [`${a.sessionId}|${a.questionId}`, a.confidence]),
  );
  const lockCorrectChanged = editRows.filter(
    (e) =>
      e.fromCorrect &&
      confidenceByKey.get(`${e.sessionId}|${e.questionId}`) === "lock",
  ).length;

  // --- calibration -----------------------------------------------------------
  const calibrationDetail = calibrationRows(
    rows,
    EXPECTED_BY_CONFIDENCE,
    CONFIDENCES,
  );
  const calibration = calibrationDetail.map((r) => ({
    confidence: r.bucket as Confidence,
    expected: r.expected,
    actual: r.actual,
    total: r.total,
    gap: r.gap,
  }));
  const calibrationMeanError = calibrationError(calibrationDetail);

  // --- rolling 7-day accuracy per skill, last 30 days -------------------------
  const trend: TrendPoint[] = [];
  const now = new Date();
  for (let back = 29; back >= 0; back--) {
    const dayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - back,
      23,
      59,
      59,
    );
    const windowStart = new Date(dayEnd.getTime() - 7 * 86_400_000);
    const point: TrendPoint = {
      date: `${dayEnd.getMonth() + 1}/${dayEnd.getDate()}`,
      rates_ratio_percent: null,
      value_order_factors: null,
      equal_unequal_alg: null,
      counting_sets_series_prob_stats: null,
    };
    for (const skill of FUNDAMENTAL_SKILLS) {
      const subset = rows.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return (
          r.skill === skill &&
          t > windowStart.getTime() &&
          t <= dayEnd.getTime()
        );
      });
      if (subset.length > 0) {
        point[skill] = Math.round(
          (subset.filter((r) => r.correct).length / subset.length) * 100,
        );
      }
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
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const today = new Date();
    for (let back = 83; back >= 0; back--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - back,
      );
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

  // --- the 24-subtopic mastery grid ------------------------------------------
  const bankCells = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      n: sqlCount(),
    })
    .from(questions)
    .where(eq(questions.verified, true))
    .groupBy(questions.subtopic, questions.difficulty)
    .all();
  const availableBy = new Map<string, number>();
  for (const c of bankCells) {
    availableBy.set(`${c.subtopic}|${c.difficulty}`, c.n);
  }
  const masteryGrid: MasteryGridRow[] = ALL_SUBTOPICS.map((subtopic) => {
    const cells: MasteryCell[] = MASTERY_BANDS.map((difficulty) => {
      const subset = rows.filter(
        (r) => r.subtopic === subtopic && r.difficulty === difficulty,
      );
      return {
        difficulty,
        correct: subset.filter((r) => r.correct).length,
        total: subset.length,
        available: availableBy.get(`${subtopic}|${difficulty}`) ?? 0,
      };
    });
    const total = cells.reduce((s, c) => s + c.total, 0);
    return {
      subtopic,
      skill: SKILL_BY_SUBTOPIC[subtopic],
      label: SUBTOPIC_LABELS[subtopic],
      cells,
      total,
      correct: cells.reduce((s, c) => s + c.correct, 0),
    };
  });

  // --- pacing: time against correctness against the section budget -----------
  const pacingRows = rows.filter((r) => r.timeSeconds > 0);
  const points: PacingPoint[] = pacingRows.slice(0, 1200).map((r) => ({
    seconds: Math.round(r.timeSeconds),
    difficulty: r.difficulty,
    correct: r.correct,
    bench: TIME_BENCH[(r.difficulty as Difficulty) ?? 3] ?? SECTION_BUDGET_SECONDS,
  }));
  const bucketEdges: TimeBucketEdge[] = [
    { from: 0, to: 45, label: "< 0:45" },
    { from: 45, to: 90, label: "0:45–1:30" },
    { from: 90, to: 128, label: "1:30–2:08" },
    { from: 128, to: 180, label: "2:08–3:00" },
    { from: 180, to: 240, label: "3:00–4:00" },
    { from: 240, to: null, label: "> 4:00" },
  ];
  const buckets: PacingBucket[] = bucketByTime(pacingRows, bucketEdges);
  const medianRaw = median(pacingRows.map((r) => r.timeSeconds));
  const medianSeconds = medianRaw == null ? null : Math.round(medianRaw);
  let rushedWrong = 0;
  let timeSinks = 0;
  let sinkOverspendSeconds = 0;
  for (const r of pacingRows) {
    const bench = TIME_BENCH[(r.difficulty as Difficulty) ?? 3] ?? SECTION_BUDGET_SECONDS;
    if (!r.correct && r.timeSeconds < bench * RUSH_RATIO) rushedWrong++;
    if (r.timeSeconds > bench * SINK_RATIO) {
      timeSinks++;
      sinkOverspendSeconds += r.timeSeconds - bench;
    }
  }
  const pacing: PacingView = {
    points,
    buckets,
    budgetSeconds: SECTION_BUDGET_SECONDS,
    medianSeconds,
    rushedWrong,
    timeSinks,
    sinkOverspendSeconds: Math.round(sinkOverspendSeconds),
  };

  // --- ELO trajectory per pattern category -----------------------------------
  const patternRows = await db
    .select({
      category: patternAttempts.category,
      correct: patternAttempts.correct,
      id: patternAttempts.id,
    })
    .from(patternAttempts)
    .orderBy(patternAttempts.id)
    .all();
  const eloTrajectories: EloTrajectory[] = PATTERN_CATEGORY_KEYS.map(
    (category) => {
      const subset = patternRows.filter((r) => r.category === category);
      let rating = ELO_START;
      const all: EloTrajectoryPoint[] = [{ n: 0, rating: ELO_START }];
      subset.forEach((row, i) => {
        rating = nextRating(rating, ELO_ITEM_RATING, row.correct);
        all.push({ n: i + 1, rating: Math.round(rating) });
      });
      // Thin to at most 60 points so a long history still draws cleanly.
      const step = Math.max(1, Math.ceil(all.length / 60));
      const points = all.filter((_, i) => i % step === 0 || i === all.length - 1);
      return {
        category,
        label: PATTERN_CATEGORY_LABELS[category],
        points,
        current: Math.round(eloMap.get(category) ?? rating),
        delta: Math.round(rating - ELO_START),
      };
    },
  );

  // --- score-report mirror ---------------------------------------------------
  // Platform accuracy is computed over QUANT formats only: Data Sufficiency
  // is a Data Insights format on the Focus Edition, so counting it here
  // would make the mirror disagree with the report it mirrors.
  const quantRows = rows.filter((r) => QUANT_FORMATS.includes(r.format));
  const dataInsightsExcluded = rows.length - quantRows.length;
  const latestReport = await db
    .select()
    .from(baselineReports)
    .orderBy(desc(baselineReports.createdAt))
    .limit(1)
    .get();
  type ReportShape = {
    total_score?: number | null;
    sections?: Array<{
      section: string;
      scaled_score: number | null;
      percentile: number | null;
    }>;
    fundamental_skills?: Array<{ skill: string; percentile: number }>;
    content_domains?: Array<{ domain: string; percentile: number }>;
    contexts?: Array<{ context: string; percentile: number }>;
  };
  const report = (latestReport?.parsed ?? {}) as ReportShape;
  const pair = <K extends string>(
    keys: readonly K[],
    labels: Record<K, string>,
    of: (row: (typeof quantRows)[number]) => K,
    reported: Map<string, number>,
  ): MirrorPair[] =>
    keys.map((key) => {
      const subset = quantRows.filter((r) => of(r) === key);
      return {
        key,
        label: labels[key],
        reported: reported.get(key) ?? null,
        platform:
          subset.length > 0
            ? Math.round(
                (subset.filter((r) => r.correct).length / subset.length) * 100,
              )
            : null,
        platformTotal: subset.length,
      };
    });
  const reportMirror: ScoreReportMirror = {
    reportedAt: latestReport?.createdAt ?? null,
    totalScore: report.total_score ?? null,
    sections: (report.sections ?? []).map((s) => ({
      section: s.section,
      label: SECTION_REPORT_LABELS[s.section] ?? s.section,
      scaledScore: s.scaled_score,
      percentile: s.percentile,
    })),
    skills: pair(
      FUNDAMENTAL_SKILLS,
      SKILL_LABELS,
      (r) => r.skill,
      new Map((report.fundamental_skills ?? []).map((s) => [s.skill, s.percentile])),
    ),
    domains: pair(
      CONTENT_DOMAINS,
      DOMAIN_LABELS,
      (r) => r.domain,
      new Map((report.content_domains ?? []).map((d) => [d.domain, d.percentile])),
    ),
    contexts: pair(
      CONTEXTS,
      CONTEXT_LABELS,
      (r) => r.context,
      new Map((report.contexts ?? []).map((c) => [c.context, c.percentile])),
    ),
    dataInsightsExcluded,
  };

  return {
    attemptCount: rows.length,
    casualExcluded,
    mirror: {
      domains: bars(CONTENT_DOMAINS, DOMAIN_LABELS, (r) => r.domain),
      contexts: bars(CONTEXTS, CONTEXT_LABELS, (r) => r.context),
      skills: bars(FUNDAMENTAL_SKILLS, SKILL_LABELS, (r) => r.skill),
    },
    heatmap: { rows: heatRows, max: heatMax },
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
    calibrationMeanError,
    trend,
    difficultyMatrix,
    volume,
    redoCompliance,
    eloBars,
    masteryGrid,
    pacing,
    eloTrajectories,
    reportMirror,
    missChains: await recentMissChains(),
  };
}
