import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { client, db } from "./index.ts";
import { loadBank, seedBankNeedsSync } from "./seed-bank.ts";
import { applyModelQuarantineMigration } from "./model-quarantine.ts";

/**
 * Self-provisioning: on a fresh database (local file or a brand-new Turso
 * instance) the first server boot applies the schema and loads the
 * committed question bank, so deploying never requires terminal
 * steps. Databases created earlier via `pnpm db:push` are left to the
 * scripts (they have no migration ledger to build on), and every step is
 * idempotent, so repeated cold starts are safe.
 */
let ready: Promise<void> | null = null;

export function ensureDbReady(): Promise<void> {
  ready ??= provision().catch((e) => {
    ready = null; // allow the next request to retry
    throw e;
  });
  return ready;
}

async function provision(): Promise<void> {
  const existing = await client.execute(
    "select name from sqlite_master where type = 'table' and name = 'questions'",
  );
  const hasTables = existing.rows.length > 0;

  if (!hasTables) {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    console.log("Q86 bootstrap: schema applied to empty database.");
  } else {
    // Existing databases never re-run migrate() (db:push-created ones
    // have no ledger to build on), so late additions land as guarded
    // DDL mirroring the migration files. Idempotent by construction.
    await evolveSchema();
  }

  const legacyQuarantined = await applyModelQuarantineMigration();
  if (legacyQuarantined > 0) {
    console.log(
      `Q86 bootstrap: quarantined ${legacyQuarantined} legacy model-generated question${legacyQuarantined === 1 ? "" : "s"}.`,
    );
  }

  // Count equality cannot detect an editorial version change or a legacy
  // row still missing its stable UID, so compare identity/version state.
  if (await seedBankNeedsSync()) {
    const { inserted, updated, backfilled, retired, revisions } =
      await loadBank();
    console.log(
      `Q86 bootstrap: seed bank loaded (${inserted} inserted, ${updated} refreshed, ${backfilled} legacy IDs backfilled, ${retired} retired, ${revisions} revision snapshots recorded).`,
    );
  }
}

/** Mirrors every migration after 0000 for databases that predate them
 *  (db:push-created databases have no ledger, so late additions land
 *  here as guarded DDL). */
async function evolveSchema(): Promise<void> {
  // drizzle/0005_question_identity.sql. ADD COLUMN lacks a portable
  // IF NOT EXISTS form across the deployed SQLite/libSQL versions, so inspect
  // first. This preserves existing numeric question IDs and all foreign keys.
  const questionColumns = await client.execute("pragma table_info('questions')");
  const questionColumnNames = new Set(
    questionColumns.rows.map((row) => String(row.name)),
  );
  if (!questionColumnNames.has("uid")) {
    await client.execute("alter table questions add column uid text");
  }
  if (!questionColumnNames.has("content_version")) {
    await client.execute(
      "alter table questions add column content_version integer default 1 not null",
    );
  }
  await client.execute(
    "create unique index if not exists questions_uid_idx on questions (uid)",
  );
  await client.execute(`create table if not exists question_revisions (
    id integer primary key autoincrement not null,
    question_id integer not null,
    content_version integer not null,
    content_hash text not null,
    snapshot text not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (question_id) references questions(id)
  )`);
  await client.execute(
    "create unique index if not exists question_revisions_version_idx on question_revisions (question_id, content_version)",
  );
  // drizzle/0004_nice_dracula.sql
  await client.execute(`create table if not exists lesson_example_attempts (
    id integer primary key autoincrement not null,
    subtopic text not null,
    example_n integer not null,
    strategy text not null,
    answer text not null,
    correct integer,
    time_seconds real not null,
    created_at integer default (unixepoch() * 1000) not null
  )`);
  await client.execute(
    "create index if not exists lesson_example_idx on lesson_example_attempts (subtopic, example_n)",
  );
  // drizzle/0003_peaceful_sue_storm.sql
  await client.execute(`create table if not exists lesson_reviews (
    id integer primary key autoincrement not null,
    subtopic text not null,
    kind text not null,
    ordinal integer not null,
    front text not null,
    back text not null,
    ease real default 2.5 not null,
    interval_days integer default 0 not null,
    reps integer default 0 not null,
    lapses integer default 0 not null,
    due_at integer not null,
    retired integer default false not null,
    created_at integer default (unixepoch() * 1000) not null,
    updated_at integer default (unixepoch() * 1000) not null
  )`);
  await client.execute(
    "create index if not exists lesson_reviews_due_idx on lesson_reviews (retired, due_at)",
  );
  await client.execute(
    "create unique index if not exists lesson_reviews_card_idx on lesson_reviews (subtopic, kind, ordinal)",
  );
  // drizzle/0002_large_captain_america.sql
  await client.execute(`create table if not exists lesson_progress (
    subtopic text primary key not null,
    read_at integer,
    checklist text default '[]' not null,
    checklist_total integer default 0 not null,
    updated_at integer default (unixepoch() * 1000) not null
  )`);
  // drizzle/0001_deep_talon.sql
  await client.execute(`create table if not exists deck_reviews (
    question_id integer primary key not null,
    ease real default 2.5 not null,
    interval_days integer default 0 not null,
    reps integer default 0 not null,
    lapses integer default 0 not null,
    due_at integer not null,
    updated_at integer default (unixepoch() * 1000) not null,
    foreign key (question_id) references questions(id)
  )`);
  await client.execute(
    "create index if not exists deck_reviews_due_idx on deck_reviews (due_at)",
  );
  await client.execute(`create table if not exists question_flags (
    id integer primary key autoincrement not null,
    question_id integer not null,
    reason text not null,
    note text,
    status text default 'open' not null,
    created_at integer default (unixepoch() * 1000) not null,
    foreign key (question_id) references questions(id)
  )`);
  await client.execute(
    "create index if not exists question_flags_status_idx on question_flags (status)",
  );
}
