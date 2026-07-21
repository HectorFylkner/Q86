import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { CertificationStatus } from "../assessment-reliability.ts";
import type { ChoiceOrder } from "../question-choice-order.ts";
import type {
  ChapterKey,
  Confidence,
  ContentDomain,
  Context,
  EditReason,
  ErrorType,
  FlagReason,
  FundamentalSkill,
  QuestionFormat,
  QuestionSource,
  SessionFocus,
  SessionMode,
  Strategy,
  Subtopic,
} from "../taxonomy.ts";

export const questions = sqliteTable(
  "questions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // Stable content identity. Seed-bank rows always carry one; legacy and
    // model-authored rows may remain null until their own identity workflow
    // assigns one. SQLite's unique index permits multiple null values.
    uid: text("uid"),
    contentVersion: integer("content_version").notNull().default(1),
    source: text("source").$type<QuestionSource>().notNull(),
    format: text("format").$type<QuestionFormat>().notNull(),
    contentDomain: text("content_domain").$type<ContentDomain>().notNull(),
    context: text("context").$type<Context>().notNull(),
    fundamentalSkill: text("fundamental_skill")
      .$type<FundamentalSkill>()
      .notNull(),
    subtopic: text("subtopic").$type<Subtopic>().notNull(),
    difficulty: integer("difficulty").notNull(),
    stemMd: text("stem_md").notNull(),
    // Five markdown strings; for DS, the canonical five.
    choices: text("choices", { mode: "json" }).$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    solutionMd: text("solution_md").notNull(),
    fastestPathMd: text("fastest_path_md").notNull(),
    // Per wrong index ("0".."4"), one sentence naming the mistake that
    // choice was built to catch.
    trapMap: text("trap_map", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull(),
    numericCheck: text("numeric_check"),
    verified: integer("verified", { mode: "boolean" })
      .notNull()
      .default(false),
    twinOf: integer("twin_of"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("questions_uid_idx").on(t.uid),
    index("questions_skill_idx").on(t.fundamentalSkill),
    index("questions_subtopic_idx").on(t.subtopic),
    index("questions_verified_idx").on(t.verified),
  ],
);

export type QuestionContentSnapshot = {
  uid: string;
  contentVersion: number;
  format: QuestionFormat;
  contentDomain: ContentDomain;
  context: Context;
  fundamentalSkill: FundamentalSkill;
  subtopic: Subtopic;
  difficulty: number;
  stemMd: string;
  choices: string[];
  correctIndex: number;
  solutionMd: string;
  fastestPathMd: string;
  trapMap: Record<string, string>;
  numericCheck: string | null;
};

/** Immutable evidence of each installed seed content version. */
export const questionRevisions = sqliteTable(
  "question_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    contentVersion: integer("content_version").notNull(),
    contentHash: text("content_hash").notNull(),
    snapshot: text("snapshot", { mode: "json" })
      .$type<QuestionContentSnapshot>()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("question_revisions_version_idx").on(
      t.questionId,
      t.contentVersion,
    ),
  ],
);

/**
 * Versioned editorial mappings from a stable question identity to the
 * source-controlled curriculum graph. Concept, archetype, and surface-form
 * definitions deliberately do not live in the database: the graph remains
 * reviewable in git, while these rows preserve which mapping was in force for
 * a particular question content version.
 */
export const questionConceptMappings = sqliteTable(
  "question_concept_mappings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    questionUid: text("question_uid").notNull(),
    questionContentVersion: integer("question_content_version").notNull(),
    conceptId: text("concept_id").notNull(),
    role: text("role").$type<"primary" | "secondary">().notNull(),
    archetypeId: text("archetype_id").notNull(),
    surfaceFormId: text("surface_form_id").notNull(),
    mappingVersion: integer("mapping_version").notNull(),
    editorialState: text("editorial_state")
      .$type<"draft" | "reviewed" | "approved" | "retired">()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("question_concept_mapping_version_idx").on(
      t.questionUid,
      t.questionContentVersion,
      t.conceptId,
      t.mappingVersion,
    ),
    uniqueIndex("question_concept_primary_version_idx")
      .on(t.questionUid, t.questionContentVersion, t.mappingVersion)
      .where(sql`${t.role} = 'primary'`),
    index("question_concept_concept_idx").on(
      t.conceptId,
      t.editorialState,
    ),
    check(
      "question_concept_content_version_check",
      sql`${t.questionContentVersion} >= 1`,
    ),
    check(
      "question_concept_mapping_version_check",
      sql`${t.mappingVersion} >= 1`,
    ),
    check(
      "question_concept_role_check",
      sql`${t.role} in ('primary', 'secondary')`,
    ),
    check(
      "question_concept_editorial_state_check",
      sql`${t.editorialState} in ('draft', 'reviewed', 'approved', 'retired')`,
    ),
  ],
);

/** One canonical distractor maps to one stable misconception per release. */
export const distractorMisconceptionMappings = sqliteTable(
  "distractor_misconception_mappings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    questionUid: text("question_uid").notNull(),
    questionContentVersion: integer("question_content_version").notNull(),
    canonicalChoiceIndex: integer("canonical_choice_index").notNull(),
    conceptId: text("concept_id").notNull(),
    misconceptionId: text("misconception_id").notNull(),
    mappingVersion: integer("mapping_version").notNull(),
    editorialState: text("editorial_state")
      .$type<"draft" | "reviewed" | "approved" | "retired">()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("distractor_misconception_version_idx").on(
      t.questionUid,
      t.questionContentVersion,
      t.canonicalChoiceIndex,
      t.mappingVersion,
    ),
    index("distractor_misconception_idx").on(t.misconceptionId),
    check(
      "distractor_choice_index_check",
      sql`${t.canonicalChoiceIndex} between 0 and 4`,
    ),
    check(
      "distractor_question_content_version_check",
      sql`${t.questionContentVersion} >= 1`,
    ),
    check(
      "distractor_mapping_version_check",
      sql`${t.mappingVersion} >= 1`,
    ),
    check(
      "distractor_editorial_state_check",
      sql`${t.editorialState} in ('draft', 'reviewed', 'approved', 'retired')`,
    ),
  ],
);

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mode: text("mode").$type<SessionMode>().notNull(),
  config: text("config", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  startedAt: integer("started_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  summary: text("summary", { mode: "json" }).$type<Record<string, unknown>>(),
});

/**
 * The immutable roster needed to replay a session exactly. Position and
 * blueprint slot are session-owned; question identity/version and the
 * display-to-canonical permutation remain fixed even after bank edits.
 */
export const sessionItems = sqliteTable(
  "session_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id),
    position: integer("position").notNull(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    questionUid: text("question_uid").notNull(),
    questionContentVersion: integer("question_content_version").notNull(),
    blueprintSlot: text("blueprint_slot").notNull(),
    choiceOrderAlgorithm: text("choice_order_algorithm").notNull(),
    displayToCanonical: text("display_to_canonical", { mode: "json" })
      .$type<ChoiceOrder>()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("session_items_position_idx").on(t.sessionId, t.position),
    uniqueIndex("session_items_question_idx").on(t.sessionId, t.questionUid),
    uniqueIndex("session_items_blueprint_slot_idx").on(
      t.sessionId,
      t.blueprintSlot,
    ),
    check("session_items_position_check", sql`${t.position} >= 0`),
    check(
      "session_items_content_version_check",
      sql`${t.questionContentVersion} >= 1`,
    ),
    check(
      "session_items_choice_order_check",
      sql`json_valid(${t.displayToCanonical})
        and json_array_length(${t.displayToCanonical}) = 5
        and json_extract(${t.displayToCanonical}, '$[0]') between 0 and 4
        and json_extract(${t.displayToCanonical}, '$[1]') between 0 and 4
        and json_extract(${t.displayToCanonical}, '$[2]') between 0 and 4
        and json_extract(${t.displayToCanonical}, '$[3]') between 0 and 4
        and json_extract(${t.displayToCanonical}, '$[4]') between 0 and 4
        and json_extract(${t.displayToCanonical}, '$[0]') != json_extract(${t.displayToCanonical}, '$[1]')
        and json_extract(${t.displayToCanonical}, '$[0]') != json_extract(${t.displayToCanonical}, '$[2]')
        and json_extract(${t.displayToCanonical}, '$[0]') != json_extract(${t.displayToCanonical}, '$[3]')
        and json_extract(${t.displayToCanonical}, '$[0]') != json_extract(${t.displayToCanonical}, '$[4]')
        and json_extract(${t.displayToCanonical}, '$[1]') != json_extract(${t.displayToCanonical}, '$[2]')
        and json_extract(${t.displayToCanonical}, '$[1]') != json_extract(${t.displayToCanonical}, '$[3]')
        and json_extract(${t.displayToCanonical}, '$[1]') != json_extract(${t.displayToCanonical}, '$[4]')
        and json_extract(${t.displayToCanonical}, '$[2]') != json_extract(${t.displayToCanonical}, '$[3]')
        and json_extract(${t.displayToCanonical}, '$[2]') != json_extract(${t.displayToCanonical}, '$[4]')
        and json_extract(${t.displayToCanonical}, '$[3]') != json_extract(${t.displayToCanonical}, '$[4]')`,
    ),
  ],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    sessionId: integer("session_id").references(() => sessions.id),
    mode: text("mode").$type<SessionMode>().notNull(),
    // "casual" attempts are excluded from analytics and plan inputs but
    // still drive rotation and the redo queue.
    focus: text("focus").$type<SessionFocus>().notNull().default("focused"),
    selectedIndex: integer("selected_index").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    timeSeconds: real("time_seconds").notNull(),
    confidence: text("confidence").$type<Confidence>().notNull(),
    errorType: text("error_type").$type<ErrorType>(),
    errorSubtag: text("error_subtag").$type<Subtopic>(),
    // Stable graph references add precision without replacing the broad,
    // official-report-compatible errorSubtag analytics spine.
    errorConceptId: text("error_concept_id"),
    misconceptionId: text("misconception_id"),
    // JSON array of up to 3 scratch-work images stored as data URLs
    // (kept in the DB so serverless hosts work; legacy rows may hold
    // relative file paths from the era of on-disk storage).
    scratchImagePath: text("scratch_image_path"),
    aiFeedbackMd: text("ai_feedback_md"),
    userNotes: text("user_notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("attempts_question_idx").on(t.questionId),
    index("attempts_session_idx").on(t.sessionId),
    index("attempts_created_idx").on(t.createdAt),
    index("attempts_error_concept_idx").on(t.errorConceptId),
    index("attempts_misconception_idx").on(t.misconceptionId),
  ],
);

// The edit ledger: every Review & Edit answer change, with outcome.
export const edits = sqliteTable("edits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  fromIndex: integer("from_index").notNull(),
  toIndex: integer("to_index").notNull(),
  fromCorrect: integer("from_correct", { mode: "boolean" }).notNull(),
  toCorrect: integer("to_correct", { mode: "boolean" }).notNull(),
  reason: text("reason").$type<EditReason>().notNull(),
  justification: text("justification").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Spaced redo queue: stage 0|1|2 → due +2d / +7d / +21d.
export const redoQueue = sqliteTable(
  "redo_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    sourceAttemptId: integer("source_attempt_id")
      .notNull()
      .references(() => attempts.id),
    stage: integer("stage").notNull().default(0),
    dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
    cleared: integer("cleared", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("redo_due_idx").on(t.cleared, t.dueAt)],
);

export const patternAttempts = sqliteTable(
  "pattern_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    category: text("category").notNull(),
    promptText: text("prompt_text").notNull(),
    correctAnswer: text("correct_answer").notNull(),
    userAnswer: text("user_answer").notNull(),
    ms: integer("ms").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("pattern_category_idx").on(t.category, t.createdAt)],
);

export const eloRatings = sqliteTable("elo_ratings", {
  category: text("category").primaryKey(),
  rating: real("rating").notNull().default(1200),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const baselineReports = sqliteTable("baseline_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rawText: text("raw_text").notNull(),
  parsed: text("parsed", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Keys: test_date, timed_set_cadence, weight overrides, model.
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Graded-recall scheduling for the takeaway deck: one row per question,
// updated on every grade (SM-2-lite; see lib/srs.ts).
export const deckReviews = sqliteTable(
  "deck_reviews",
  {
    questionId: integer("question_id")
      .primaryKey()
      .references(() => questions.id),
    ease: real("ease").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("deck_reviews_due_idx").on(t.dueAt)],
);

// Lesson progress that cannot be derived from attempts: when a chapter
// was first opened and which pre-drill checklist items are ticked. One
// row per chapter; the daily plan reads this to sequence the curriculum.
// (Chapter keys are taxonomy subtopics — the lesson filename, the route
// param, and this column are the same string.)
export const lessonProgress = sqliteTable("lesson_progress", {
  subtopic: text("subtopic").$type<ChapterKey>().primaryKey(),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
  // Checked item indexes into the chapter's "Before you drill" list.
  checklist: text("checklist", { mode: "json" })
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'`),
  checklistTotal: integer("checklist_total").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// Worked-example commitments: before a lesson example reveals, the
// user commits a strategy and an answer — both land here with timing,
// so the lesson's honor system becomes evidence and strategy selection
// gets per-method accuracy/time data. correct is graded server-side
// against the example's answer where extractable, then self-markable.
export const lessonExampleAttempts = sqliteTable(
  "lesson_example_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subtopic: text("subtopic").$type<ChapterKey>().notNull(),
    exampleN: integer("example_n").notNull(),
    strategy: text("strategy").$type<Strategy>().notNull(),
    answer: text("answer").notNull(),
    correct: integer("correct", { mode: "boolean" }),
    timeSeconds: real("time_seconds").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("lesson_example_idx").on(t.subtopic, t.exampleN)],
);

/**
 * Evidence from independently addressable examples and checks. The item UID
 * and version are authored in the source-controlled concept segment; the
 * attempt UID makes retries and offline/form replays idempotent without
 * collapsing legitimate later attempts on the same item.
 */
export const conceptLearningAttempts = sqliteTable(
  "concept_learning_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    attemptUid: text("attempt_uid").notNull(),
    sessionId: integer("session_id").references(() => sessions.id),
    conceptId: text("concept_id").notNull(),
    itemUid: text("item_uid").notNull(),
    itemContentVersion: integer("item_content_version").notNull(),
    itemKind: text("item_kind").$type<"example" | "check">().notNull(),
    originalAnswer: text("original_answer"),
    originalMethod: text("original_method"),
    declaredUnknown: integer("declared_unknown", { mode: "boolean" })
      .notNull()
      .default(false),
    highestHintLevel: integer("highest_hint_level").notNull().default(0),
    correction: text("correction"),
    finalAnswer: text("final_answer"),
    initialCorrect: integer("initial_correct", { mode: "boolean" }).notNull(),
    finalCorrect: integer("final_correct", { mode: "boolean" }).notNull(),
    timeSeconds: real("time_seconds").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("concept_learning_attempt_uid_idx").on(t.attemptUid),
    index("concept_learning_item_idx").on(
      t.conceptId,
      t.itemUid,
      t.createdAt,
    ),
    index("concept_learning_session_idx").on(t.sessionId),
    check(
      "concept_learning_item_version_check",
      sql`${t.itemContentVersion} >= 1`,
    ),
    check(
      "concept_learning_item_kind_check",
      sql`${t.itemKind} in ('example', 'check')`,
    ),
    check(
      "concept_learning_original_commitment_check",
      sql`${t.declaredUnknown} = 1 or (${t.originalAnswer} is not null and length(trim(${t.originalAnswer})) > 0)`,
    ),
    check(
      "concept_learning_unknown_correctness_check",
      sql`not (${t.declaredUnknown} = 1 and ${t.initialCorrect} = 1)`,
    ),
    check(
      "concept_learning_hint_level_check",
      sql`${t.highestHintLevel} between 0 and 5`,
    ),
    check(
      "concept_learning_final_answer_check",
      sql`${t.finalCorrect} = 0 or (${t.finalAnswer} is not null and length(trim(${t.finalAnswer})) > 0)`,
    ),
    check("concept_learning_time_check", sql`${t.timeSeconds} >= 0`),
  ],
);

/**
 * Fine-grained, immutable assistance evidence. One event can link to the
 * eventual graded attempt, the pre-answer session item, or both.
 */
export const assistanceEvents = sqliteTable(
  "assistance_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventUid: text("event_uid").notNull(),
    conceptId: text("concept_id").notNull(),
    misconceptionId: text("misconception_id"),
    learningAttemptId: integer("learning_attempt_id").references(
      () => conceptLearningAttempts.id,
    ),
    questionAttemptId: integer("question_attempt_id").references(
      () => attempts.id,
    ),
    sessionItemId: integer("session_item_id").references(
      () => sessionItems.id,
    ),
    kind: text("kind")
      .$type<
        | "hint_opened"
        | "hint_applied"
        | "worked_solution_revealed"
        | "tutor_intervention"
      >()
      .notNull(),
    hintLevel: integer("hint_level"),
    details: text("details", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'`),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("assistance_event_uid_idx").on(t.eventUid),
    index("assistance_concept_time_idx").on(t.conceptId, t.occurredAt),
    index("assistance_learning_attempt_idx").on(t.learningAttemptId),
    index("assistance_question_attempt_idx").on(t.questionAttemptId),
    check(
      "assistance_event_kind_check",
      sql`${t.kind} in ('hint_opened', 'hint_applied', 'worked_solution_revealed', 'tutor_intervention')`,
    ),
    check(
      "assistance_event_subject_check",
      sql`${t.learningAttemptId} is not null or ${t.questionAttemptId} is not null or ${t.sessionItemId} is not null`,
    ),
    check(
      "assistance_event_hint_level_check",
      sql`${t.hintLevel} is null or ${t.hintLevel} between 1 and 5`,
    ),
  ],
);

/**
 * Append-only certification ledger. Current state is derived from the highest
 * contiguous sequence for a concept; no mutable "mastered" truth is stored.
 */
export const conceptCertificationTransitions = sqliteTable(
  "concept_certification_transitions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    transitionUid: text("transition_uid").notNull(),
    conceptId: text("concept_id").notNull(),
    sequence: integer("sequence").notNull(),
    fromStatus: text("from_status").$type<CertificationStatus>().notNull(),
    toStatus: text("to_status").$type<CertificationStatus>().notNull(),
    eventType: text("event_type")
      .$type<
        | "accuracy_passed"
        | "timed_transfer_passed"
        | "stale"
        | "evidence_slipped"
        | "recertification_started"
        | "recertification_passed"
        | "recertification_failed"
      >()
      .notNull(),
    evidenceSessionId: integer("evidence_session_id").references(
      () => sessions.id,
    ),
    evidence: text("evidence", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'`),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("concept_certification_transition_uid_idx").on(
      t.transitionUid,
    ),
    uniqueIndex("concept_certification_sequence_idx").on(
      t.conceptId,
      t.sequence,
    ),
    index("concept_certification_time_idx").on(t.conceptId, t.occurredAt),
    check("concept_certification_sequence_check", sql`${t.sequence} >= 0`),
    check(
      "concept_certification_from_status_check",
      sql`${t.fromStatus} in ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')`,
    ),
    check(
      "concept_certification_to_status_check",
      sql`${t.toStatus} in ('unproven', 'accuracy_proven', 'certified', 'recertification_required', 'recertifying')`,
    ),
    check(
      "concept_certification_event_type_check",
      sql`${t.eventType} in ('accuracy_passed', 'timed_transfer_passed', 'stale', 'evidence_slipped', 'recertification_started', 'recertification_passed', 'recertification_failed')`,
    ),
  ],
);

/** A concrete next action produced by diagnosis, not an inert analytics row. */
export const conceptRemediations = sqliteTable(
  "concept_remediations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    remediationUid: text("remediation_uid").notNull(),
    conceptId: text("concept_id").notNull(),
    misconceptionId: text("misconception_id"),
    sourceQuestionAttemptId: integer("source_question_attempt_id").references(
      () => attempts.id,
    ),
    sourceLearningAttemptId: integer("source_learning_attempt_id").references(
      () => conceptLearningAttempts.id,
    ),
    sourceCertificationTransitionId: integer(
      "source_certification_transition_id",
    ).references(() => conceptCertificationTransitions.id),
    trigger: text("trigger")
      .$type<
        | "wrong"
        | "slow"
        | "hinted"
        | "low_confidence"
        | "changed_from_correct"
        | "retention_slip"
        | "stale"
        | "manual"
      >()
      .notNull(),
    actionType: text("action_type")
      .$type<
        | "review_concept"
        | "review_misconception"
        | "retry_check"
        | "targeted_practice"
        | "retrieval_card"
        | "recertify_concept"
      >()
      .notNull(),
    // Stable graph/content ID; consumers derive the route rather than storing
    // a brittle URL.
    actionTargetId: text("action_target_id").notNull(),
    status: text("status")
      .$type<"open" | "in_progress" | "resolved" | "dismissed">()
      .notNull()
      .default("open"),
    priority: integer("priority").notNull().default(3),
    rationaleMd: text("rationale_md").notNull(),
    dueAt: integer("due_at", { mode: "timestamp_ms" }),
    resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
    resolutionEvidence: text("resolution_evidence", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("concept_remediation_uid_idx").on(t.remediationUid),
    index("concept_remediation_queue_idx").on(t.status, t.dueAt, t.priority),
    index("concept_remediation_concept_idx").on(t.conceptId, t.status),
    check(
      "concept_remediation_trigger_check",
      sql`${t.trigger} in ('wrong', 'slow', 'hinted', 'low_confidence', 'changed_from_correct', 'retention_slip', 'stale', 'manual')`,
    ),
    check(
      "concept_remediation_action_check",
      sql`${t.actionType} in ('review_concept', 'review_misconception', 'retry_check', 'targeted_practice', 'retrieval_card', 'recertify_concept')`,
    ),
    check(
      "concept_remediation_status_check",
      sql`${t.status} in ('open', 'in_progress', 'resolved', 'dismissed')`,
    ),
    check(
      "concept_remediation_priority_check",
      sql`${t.priority} between 1 and 5`,
    ),
    check(
      "concept_remediation_source_check",
      sql`${t.trigger} = 'manual' or ${t.sourceQuestionAttemptId} is not null or ${t.sourceLearningAttemptId} is not null or ${t.sourceCertificationTransitionId} is not null`,
    ),
    check(
      "concept_remediation_resolution_check",
      sql`((${t.status} in ('resolved', 'dismissed')) and ${t.resolvedAt} is not null)
        or ((${t.status} in ('open', 'in_progress')) and ${t.resolvedAt} is null)`,
    ),
  ],
);

// Concept-level spaced retrieval: a chapter's trigger cues and trap
// gallery become retrieval-first cards when its test is passed, merged
// into the daily deck (question-derived cards keep priority) and
// scheduled by the same SM-2-lite ladder (lib/srs.ts). Rows are never
// deleted — cards whose source bullet left the chapter retire.
export const lessonReviews = sqliteTable(
  "lesson_reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subtopic: text("subtopic").$type<ChapterKey>().notNull(),
    kind: text("kind").$type<"cue" | "trap">().notNull(),
    // Position in the chapter's parsed cue/trap list at enrollment,
    // the stable identity for idempotent re-enrollment.
    ordinal: integer("ordinal").notNull(),
    front: text("front").notNull(),
    back: text("back").notNull(),
    ease: real("ease").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
    retired: integer("retired", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("lesson_reviews_due_idx").on(t.retired, t.dueAt),
    uniqueIndex("lesson_reviews_card_idx").on(t.subtopic, t.kind, t.ordinal),
  ],
);

// Content QC: questions the user flags mid-review. Resolving may retire
// the question (verified = false) — rows are never deleted.
export const questionFlags = sqliteTable(
  "question_flags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    reason: text("reason").$type<FlagReason>().notNull(),
    note: text("note"),
    status: text("status").$type<"open" | "resolved">().notNull().default("open"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("question_flags_status_idx").on(t.status)],
);

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionRevision = typeof questionRevisions.$inferSelect;
export type QuestionConceptMapping =
  typeof questionConceptMappings.$inferSelect;
export type DistractorMisconceptionMapping =
  typeof distractorMisconceptionMappings.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type SessionItem = typeof sessionItems.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type Edit = typeof edits.$inferSelect;
export type NewEdit = typeof edits.$inferInsert;
export type RedoItem = typeof redoQueue.$inferSelect;
export type PatternAttempt = typeof patternAttempts.$inferSelect;
export type EloRating = typeof eloRatings.$inferSelect;
export type BaselineReport = typeof baselineReports.$inferSelect;
export type DeckReview = typeof deckReviews.$inferSelect;
export type QuestionFlag = typeof questionFlags.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type LessonReview = typeof lessonReviews.$inferSelect;
export type LessonExampleAttempt = typeof lessonExampleAttempts.$inferSelect;
export type ConceptLearningAttempt =
  typeof conceptLearningAttempts.$inferSelect;
export type AssistanceEvent = typeof assistanceEvents.$inferSelect;
export type ConceptCertificationTransition =
  typeof conceptCertificationTransitions.$inferSelect;
export type ConceptRemediation = typeof conceptRemediations.$inferSelect;
