import { and, eq, type SQL } from "drizzle-orm";
import { db, type DB } from "./index.ts";
import {
  attempts,
  baselineReports,
  deckReviews,
  edits,
  eloRatings,
  patternAttempts,
  questionFlags,
  redoQueue,
  sessions,
  settings,
} from "./schema.ts";

/**
 * The tenancy choke point (ADR 0001).
 *
 * Every row of user data in Q86 belongs to exactly one account, and the
 * only way to reach it from a request is through a `ScopedDb` built from
 * that account's session. The accessor injects `user_id` on write and
 * conjoins the tenant predicate into every read, update and delete, so
 * isolation is a property of this module rather than of ~60 remembered
 * `where` clauses.
 *
 * Two things keep it honest:
 *   - `lib/db/schema.ts` declares `user_id` NOT NULL on every owned table,
 *     so an insert that skips the accessor is a compile error.
 *   - `tests/unit/tenancy-structure.test.ts` asserts that no module
 *     outside `lib/db/` imports the raw handle, and that every query
 *     against an owned table carries a tenant predicate.
 *
 * `questions` is deliberately absent from `OWNED_TABLES`: the verified
 * bank is shared read-only content, not user data (ADR 0001 §2).
 */

export const OWNED_TABLES = {
  sessions,
  attempts,
  edits,
  redo_queue: redoQueue,
  pattern_attempts: patternAttempts,
  elo_ratings: eloRatings,
  baseline_reports: baselineReports,
  settings,
  deck_reviews: deckReviews,
  question_flags: questionFlags,
} as const;

export type OwnedTable = (typeof OWNED_TABLES)[keyof typeof OWNED_TABLES];

/** Table names, for the structural test and the export/erase routines. */
export const OWNED_TABLE_NAMES = Object.keys(OWNED_TABLES) as Array<
  keyof typeof OWNED_TABLES
>;

/** The handle a scoped accessor wraps: the pool, or a transaction. */
type Handle = DB | Parameters<Parameters<DB["transaction"]>[0]>[0];

export class ScopedDb {
  readonly userId: string;
  readonly handle: Handle;

  constructor(userId: string, handle: Handle = db) {
    if (!userId) {
      // Defensive: an empty owner would silently widen every predicate.
      throw new Error("ScopedDb requires a non-empty userId.");
    }
    this.userId = userId;
    this.handle = handle;
  }

  /**
   * The tenant predicate for one owned table, conjoined with any extra
   * conditions. Every query that touches user data must build its `where`
   * from this — including joins, which cannot be pre-scoped by a builder.
   */
  own<T extends OwnedTable>(
    table: T,
    ...extra: Array<SQL | undefined>
  ): SQL {
    return and(eq(table.userId, this.userId), ...extra) as SQL;
  }

  /**
   * The raw Drizzle handle, for queries whose `where` comes from `own()` —
   * joins onto `questions`, aggregates, and reads of the global bank. The
   * name is deliberately terse but the structural test checks that every
   * `.q` statement touching an owned table also calls `own(`.
   */
  get q(): Handle {
    return this.handle;
  }

  /** All rows of an owned table matching the extra conditions. */
  rows<T extends OwnedTable>(
    table: T,
    ...extra: Array<SQL | undefined>
  ): Promise<T["$inferSelect"][]> {
    return (this.handle as DB)
      .select()
      .from(table as OwnedTable)
      .where(this.own(table, ...extra))
      .all() as Promise<T["$inferSelect"][]>;
  }

  /** The first row matching, or null. */
  async row<T extends OwnedTable>(
    table: T,
    ...extra: Array<SQL | undefined>
  ): Promise<T["$inferSelect"] | null> {
    const found = await (this.handle as DB)
      .select()
      .from(table as OwnedTable)
      .where(this.own(table, ...extra))
      .limit(1)
      .get();
    return (found ?? null) as T["$inferSelect"] | null;
  }

  /** Insert one row, stamping the owner. Returns the inserted row. */
  async insert<T extends OwnedTable>(
    table: T,
    values: Omit<T["$inferInsert"], "userId">,
  ): Promise<T["$inferSelect"]> {
    const row = await (this.handle as DB)
      .insert(table as OwnedTable)
      .values({ ...values, userId: this.userId } as T["$inferInsert"])
      .returning()
      .get();
    return row as T["$inferSelect"];
  }

  /** Insert without reading the row back (the hot path in bulk saves). */
  async add<T extends OwnedTable>(
    table: T,
    values: Omit<T["$inferInsert"], "userId">,
  ): Promise<void> {
    await (this.handle as DB)
      .insert(table as OwnedTable)
      .values({ ...values, userId: this.userId } as T["$inferInsert"])
      .run();
  }

  /** Update rows the caller owns. Never widens past the tenant predicate. */
  async update<T extends OwnedTable>(
    table: T,
    patch: Partial<Omit<T["$inferInsert"], "userId">>,
    ...extra: Array<SQL | undefined>
  ): Promise<void> {
    await (this.handle as DB)
      .update(table as OwnedTable)
      .set(patch as Record<string, unknown>)
      .where(this.own(table, ...extra))
      .run();
  }

  /** Delete rows the caller owns (GDPR erasure, referral cleanup). */
  async remove<T extends OwnedTable>(
    table: T,
    ...extra: Array<SQL | undefined>
  ): Promise<void> {
    await (this.handle as DB)
      .delete(table as OwnedTable)
      .where(this.own(table, ...extra))
      .run();
  }

  /** A transaction whose callback receives an equally scoped accessor. */
  transaction<R>(fn: (tx: ScopedDb) => Promise<R>): Promise<R> {
    return (this.handle as DB).transaction(async (tx) =>
      fn(new ScopedDb(this.userId, tx)),
    );
  }
}

/** Build an accessor for a known owner. Prefer `requireScoped()` in
 *  request code — this exists for scripts, tests, and webhook handlers
 *  that resolve the owner from something other than a cookie. */
export function scopedFor(userId: string, handle?: Handle): ScopedDb {
  return new ScopedDb(userId, handle);
}
