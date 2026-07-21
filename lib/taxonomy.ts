// The domain taxonomy. Mirrors the official GMAT score-report
// categories exactly so platform analytics map 1:1 to real reports.

export const CONTENT_DOMAINS = ["arithmetic", "algebra"] as const;
export type ContentDomain = (typeof CONTENT_DOMAINS)[number];

export const CONTEXTS = ["pure", "real"] as const;
export type Context = (typeof CONTEXTS)[number];

export const FORMATS = ["problem_solving", "data_sufficiency"] as const;
export type QuestionFormat = (typeof FORMATS)[number];

export const FUNDAMENTAL_SKILLS = [
  "rates_ratio_percent",
  "value_order_factors",
  "equal_unequal_alg",
  "counting_sets_series_prob_stats",
] as const;
export type FundamentalSkill = (typeof FUNDAMENTAL_SKILLS)[number];

export const SUBTOPICS_BY_SKILL = {
  value_order_factors: [
    "prime_factorization",
    "divisibility_gcf_lcm",
    "remainders_units_digits",
    "parity_signs",
    "consecutive_evenly_spaced",
    "exponents_roots_properties",
    "abs_value_number_line_decimals",
    "must_be_true_testing",
  ],
  equal_unequal_alg: [
    "linear_systems",
    "quadratics_factoring",
    "inequalities",
    "functions_sequences",
    "algebraic_translation",
    "min_max_optimization",
  ],
  rates_ratio_percent: [
    "percent_change_chains",
    "ratios_proportions",
    "rates_speed_work",
    "mixtures_weighted_avg",
    "interest_profit_discount",
  ],
  counting_sets_series_prob_stats: [
    "overlapping_sets",
    "combinatorics",
    "probability",
    "statistics_mean_median_sd",
    "series_patterns",
  ],
} as const;

export type Subtopic =
  (typeof SUBTOPICS_BY_SKILL)[FundamentalSkill][number];

export const ALL_SUBTOPICS: Subtopic[] = Object.values(
  SUBTOPICS_BY_SKILL,
).flat() as Subtopic[];

export const SKILL_BY_SUBTOPIC: Record<Subtopic, FundamentalSkill> =
  Object.fromEntries(
    (
      Object.entries(SUBTOPICS_BY_SKILL) as [
        FundamentalSkill,
        readonly Subtopic[],
      ][]
    ).flatMap(([skill, subs]) => subs.map((s) => [s, skill])),
  ) as Record<Subtopic, FundamentalSkill>;

// Strategy chapters live on the Learn index beside the subtopic
// chapters but teach cross-cutting method, so they have no question
// pool and no chapter test. They extend the chapter namespace (lesson
// filename = route param = progress key), never the question taxonomy
// — questions always carry a real subtopic.
export const STRATEGY_CHAPTERS = [
  "data_sufficiency_discipline",
  "choosing_fastest_path",
] as const;
export type StrategyChapter = (typeof STRATEGY_CHAPTERS)[number];

/** Anything a lesson file, learn route, or lesson-progress row can be
 *  keyed by: a drillable subtopic or a strategy chapter. */
export type ChapterKey = Subtopic | StrategyChapter;

export const ERROR_TYPES = [
  "content_gap",
  "setup_error",
  "calculation_error",
  "misread",
  "time_pressure",
  "guess",
] as const;
export type ErrorType = (typeof ERROR_TYPES)[number];

export const CONFIDENCES = ["guess", "lean", "lock"] as const;
export type Confidence = (typeof CONFIDENCES)[number];

export const SESSION_MODES = [
  "drill",
  "timed_set",
  "section_sim",
  "pattern",
  "redo",
] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

// Declared at session start. Casual attempts still count for question
// rotation and the redo queue, but are excluded from every performance
// statistic (analytics, calibration, daily-plan skill weights).
export const SESSION_FOCUS = ["focused", "casual"] as const;
export type SessionFocus = (typeof SESSION_FOCUS)[number];

export const QUESTION_SOURCES = ["seed", "generated", "twin"] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];

// The four solution strategies a worked example can be attacked with.
// Committed before every reveal, so strategy selection becomes a
// trained, measured habit rather than a narrated one.
export const STRATEGIES = [
  "algebra",
  "backsolve",
  "smart_numbers",
  "test_cases",
] as const;
export type Strategy = (typeof STRATEGIES)[number];

// Content QC: reasons a question can be flagged from the runner.
export const FLAG_REASONS = [
  "suspected_error",
  "ambiguous",
  "typo",
  "other",
] as const;
export type FlagReason = (typeof FLAG_REASONS)[number];

export type Difficulty = 1 | 2 | 3 | 4 | 5;
export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5];

// ---------------------------------------------------------------------------
// Labels (sentence case; skill labels match the official score report)
// ---------------------------------------------------------------------------

export const SKILL_LABELS: Record<FundamentalSkill, string> = {
  rates_ratio_percent: "Rates/Ratio/Percent",
  value_order_factors: "Value/Order/Factors",
  equal_unequal_alg: "Equalities/Inequalities/Algebra",
  counting_sets_series_prob_stats: "Counting/Sets/Series/Prob/Stats",
};

export const SKILL_SHORT_LABELS: Record<FundamentalSkill, string> = {
  rates_ratio_percent: "Rates/Percent",
  value_order_factors: "VOF",
  equal_unequal_alg: "Algebra",
  counting_sets_series_prob_stats: "Counting/Stats",
};

export const SUBTOPIC_LABELS: Record<Subtopic, string> = {
  prime_factorization: "Prime factorization",
  divisibility_gcf_lcm: "Divisibility, GCF & LCM",
  remainders_units_digits: "Remainders & units digits",
  parity_signs: "Parity & signs",
  consecutive_evenly_spaced: "Consecutive & evenly spaced sets",
  exponents_roots_properties: "Exponent & root properties",
  abs_value_number_line_decimals: "Absolute value, number line & decimals",
  must_be_true_testing: "Must-be-true testing",
  linear_systems: "Linear systems",
  quadratics_factoring: "Quadratics & factoring",
  inequalities: "Inequalities",
  functions_sequences: "Functions & sequences",
  algebraic_translation: "Algebraic translation",
  min_max_optimization: "Min/max optimization",
  percent_change_chains: "Percent change chains",
  ratios_proportions: "Ratios & proportions",
  rates_speed_work: "Rates, speed & work",
  mixtures_weighted_avg: "Mixtures & weighted averages",
  interest_profit_discount: "Interest, profit & discount",
  overlapping_sets: "Overlapping sets",
  combinatorics: "Combinatorics",
  probability: "Probability",
  statistics_mean_median_sd: "Statistics: mean, median & SD",
  series_patterns: "Series & patterns",
};

export const STRATEGY_CHAPTER_LABELS: Record<StrategyChapter, string> = {
  data_sufficiency_discipline: "Data Sufficiency decision discipline",
  choosing_fastest_path: "Choosing the fastest path",
};

export const ALL_CHAPTER_KEYS: ChapterKey[] = [
  ...ALL_SUBTOPICS,
  ...STRATEGY_CHAPTERS,
];

export const CHAPTER_LABELS: Record<ChapterKey, string> = {
  ...SUBTOPIC_LABELS,
  ...STRATEGY_CHAPTER_LABELS,
};

export const CONTEXT_LABELS: Record<Context, string> = {
  pure: "Pure",
  real: "Real",
};

export const DOMAIN_LABELS: Record<ContentDomain, string> = {
  arithmetic: "Arithmetic",
  algebra: "Algebra",
};

export const FORMAT_LABELS: Record<QuestionFormat, string> = {
  problem_solving: "Problem solving",
  data_sufficiency: "Data sufficiency",
};

export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  content_gap: "Content gap",
  setup_error: "Setup error",
  calculation_error: "Calculation error",
  misread: "Misread",
  time_pressure: "Time pressure",
  guess: "Guess",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  guess: "Guess",
  lean: "Lean",
  lock: "Lock",
};

export const STRATEGY_LABELS: Record<Strategy, string> = {
  algebra: "Algebra",
  backsolve: "Backsolve",
  smart_numbers: "Smart numbers",
  test_cases: "Test cases",
};

export const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  suspected_error: "Suspected error",
  ambiguous: "Ambiguous",
  typo: "Typo / formatting",
  other: "Other",
};

export const EDIT_REASONS = [
  "found_calc_error",
  "misread",
  "new_solution_path",
] as const;
export type EditReason = (typeof EDIT_REASONS)[number];

export const EDIT_REASON_LABELS: Record<EditReason, string> = {
  found_calc_error: "Found a calculation error",
  misread: "Misread the question",
  new_solution_path: "Found a new solution path",
};

// Difficulty labels are approximate by design: 3 ≈ mid-level official,
// 5 ≈ hardest official.
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "D1 · easy (approx.)",
  2: "D2 · easier official (approx.)",
  3: "D3 · mid official (approx.)",
  4: "D4 · hard official (approx.)",
  5: "D5 · hardest official (approx.)",
};

// The five canonical data-sufficiency answer choices, in our own words,
// rendered as fixed choices for every DS question.
export const DS_CHOICES: string[] = [
  "Statement (1) alone is sufficient, but statement (2) alone is not.",
  "Statement (2) alone is sufficient, but statement (1) alone is not.",
  "Both statements together are sufficient, but neither alone is.",
  "Each statement alone is sufficient.",
  "Statements (1) and (2) together are not sufficient.",
];
