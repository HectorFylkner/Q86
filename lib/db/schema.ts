import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type {
  Confidence,
  ContentDomain,
  Context,
  EditReason,
  ErrorType,
  FundamentalSkill,
  QuestionFormat,
  QuestionSource,
  SessionMode,
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
    selectedIndex: integer("selected_index").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    timeSeconds: real("time_seconds").notNull(),
    confidence: text("confidence").$type<Confidence>().notNull(),
    errorType: text("error_type").$type<ErrorType>(),
    errorSubtag: text("error_subtag").$type<Subtopic>(),
    // JSON array of up to 3 relative paths under ./data/scratch/.
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
