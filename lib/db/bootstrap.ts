import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { client, db } from "./index.ts";
import {
  loadBank,
  readBank,
  userRetiredIds,
  verifiedSeedCount,
} from "./seed-bank.ts";

/**
 * Self-provisioning: on a fresh database (local file or a brand-new Turso
 * instance) the first server boot applies the schema and loads the
 * committed 360-question bank, so deploying never requires terminal
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

  // User-retired questions stay unverified, so the expected count shrinks
  // by that many — otherwise every boot would re-run the loader forever.
  const bankSize =
    readBank().questions.length - (await userRetiredIds()).size;
  if ((await verifiedSeedCount()) < bankSize) {
    const { inserted, updated, retired } = await loadBank();
    console.log(
      `Q86 bootstrap: seed bank loaded (${inserted} inserted, ${updated} refreshed, ${retired} retired).`,
    );
  }
}

/** Mirrors drizzle/0001_deep_talon.sql for databases that predate it. */
async function evolveSchema(): Promise<void> {
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
