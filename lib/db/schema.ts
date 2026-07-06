import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
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
    index("questions_skill_idx").on(t.fundamentalSkill),
    index("questions_subtopic_idx").on(t.subtopic),
    index("questions_verified_idx").on(t.verified),
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
export type Session = typeof sessions.$inferSelect;
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
