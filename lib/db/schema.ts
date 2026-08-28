import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type {
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
  Subtopic,
} from "../taxonomy.ts";


// ---------------------------------------------------------------------------
// Identity (ADR 0002). Sessions and tokens are stored as SHA-256 digests:
// the database never holds a credential that could be replayed.
// ---------------------------------------------------------------------------

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    // Always stored lowercased and trimmed; uniqueness is enforced by index.
    email: text("email").notNull(),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
    // Null for accounts that only ever signed in with Google.
    passwordHash: text("password_hash"),
    name: text("name"),
    locale: text("locale").$type<"sv" | "en">().notNull().default("sv"),
    role: text("role").$type<"user" | "admin">().notNull().default("user"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

/** One row per signed-in browser. `id` is sha256(raw token). */
export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("auth_sessions_user_idx").on(t.userId)],
);

/** Federated identities. One row per (provider, subject). */
export const authAccounts = sqliteTable(
  "auth_accounts",
  {
    provider: text("provider").$type<"google">().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("auth_accounts_user_idx").on(t.userId),
  ],
);

/** Single-use tokens: password reset, magic link, email verification.
 *  `id` is sha256(raw token); `usedAt` makes replay a no-op. */
export const authTokens = sqliteTable(
  "auth_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind")
      .$type<"password_reset" | "magic_link" | "email_verify">()
      .notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("auth_tokens_user_idx").on(t.userId, t.kind)],
);


// ---------------------------------------------------------------------------
// Billing (ADR 0003). One row per account; written only by the webhook and
// the checkout handler, read through the entitlement resolver.
// ---------------------------------------------------------------------------

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").$type<"free" | "monthly" | "sprint">().notNull(),
    // Mirrors Stripe's subscription status, plus "none" before any purchase
    // and "expired" for a fixed-length plan whose window has closed.
    status: text("status")
      .$type<
        | "none"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "unpaid"
        | "expired"
      >()
      .notNull()
      .default("none"),
    /** Access runs until this instant, for both recurring and fixed plans. */
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" })
      .notNull()
      .default(false),
    trialEndsAt: integer("trial_ends_at", { mode: "timestamp_ms" }),
    /**
     * The Stripe event that last wrote this row, and when Stripe created it.
     * Out-of-order webhook delivery is resolved by refusing to apply an
     * event older than the one already recorded.
     */
    lastEventId: text("last_event_id"),
    lastEventAt: integer("last_event_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("subscriptions_customer_idx").on(t.stripeCustomerId),
    index("subscriptions_subscription_idx").on(t.stripeSubscriptionId),
  ],
);

/**
 * The idempotency ledger. Every processed Stripe event id is written here
 * inside the same transaction that applies it, so a replay finds its id
 * present and returns without re-applying (ADR 0003).
 */
export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  /** Stripe's own creation time, used for ordering. */
  stripeCreatedAt: integer("stripe_created_at", { mode: "timestamp_ms" }).notNull(),
  receivedAt: integer("received_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  /** Which account it resolved to, when it resolved to one. */
  userId: text("user_id"),
  /** Short note when an event was accepted but deliberately not applied. */
  outcome: text("outcome").notNull().default("applied"),
});

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

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").$type<SessionMode>().notNull(),
    config: text("config", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    endedAt: integer("ended_at", { mode: "timestamp_ms" }),
    summary: text("summary", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (t) => [index("sessions_user_idx").on(t.userId, t.mode)],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    index("attempts_user_created_idx").on(t.userId, t.createdAt),
    index("attempts_user_question_idx").on(t.userId, t.questionId),
    index("attempts_session_idx").on(t.sessionId),
  ],
);

// The edit ledger: every Review & Edit answer change, with outcome.
export const edits = sqliteTable(
  "edits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  },
  (t) => [index("edits_user_idx").on(t.userId)],
);

// Spaced redo queue: stage 0|1|2 → due +2d / +7d / +21d.
export const redoQueue = sqliteTable(
  "redo_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  (t) => [index("redo_due_idx").on(t.userId, t.cleared, t.dueAt)],
);

export const patternAttempts = sqliteTable(
  "pattern_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  (t) => [index("pattern_category_idx").on(t.userId, t.category, t.createdAt)],
);

export const eloRatings = sqliteTable(
  "elo_ratings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    rating: real("rating").notNull().default(1200),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.category] })],
);

export const baselineReports = sqliteTable(
  "baseline_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rawText: text("raw_text").notNull(),
    parsed: text("parsed", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("baseline_reports_user_idx").on(t.userId, t.createdAt)],
);

// Keys: test_date, timed_set_cadence, weight overrides, model.
/**
 * Instance-wide configuration, owned by the operator rather than by any
 * account: the AI model override, the seed-loader progress marker, and the
 * ids of questions retired by admin triage. These lived in `settings`
 * while Q86 had one user; multi-tenancy separates them so a user cannot
 * read or write instance state (ADR 0001).
 */
export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** Per-account preferences: test_date, timed_set_cadence, weight_overrides. */
export const settings = sqliteTable(
  "settings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

// Graded-recall scheduling for the takeaway deck: one row per question,
// updated on every grade (SM-2-lite; see lib/srs.ts).
export const deckReviews = sqliteTable(
  "deck_reviews",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
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
  (t) => [
    primaryKey({ columns: [t.userId, t.questionId] }),
    index("deck_reviews_due_idx").on(t.userId, t.dueAt),
  ],
);

// Content QC: questions the user flags mid-review. Resolving may retire
// the question (verified = false) — rows are never deleted.
export const questionFlags = sqliteTable(
  "question_flags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  (t) => [index("question_flags_status_idx").on(t.status, t.createdAt)],
);

export type AppSetting = typeof appSettings.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthAccount = typeof authAccounts.$inferSelect;
export type AuthToken = typeof authTokens.$inferSelect;
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
