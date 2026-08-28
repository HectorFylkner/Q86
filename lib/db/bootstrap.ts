import fs from "node:fs";
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
 * committed 180-question bank, so deploying never requires terminal
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

/**
 * Databases created by `pnpm db:push` have no migration ledger for
 * `migrate()` to build on, so late schema additions land here as guarded,
 * idempotent DDL that mirrors the migration files.
 */
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

  // Last, so the tenancy rebuild finds every table it has to convert —
  // including the two this function may just have created.
  await applyTenancyIfMissing();
}

/**
 * The multi-tenancy conversion for ledger-less databases. Rather than
 * restating 60 statements in TypeScript — a second source of truth that
 * would drift — this replays drizzle/0002_multitenant.sql itself through
 * `client.migrate()`, which is the libSQL entry point that runs a batch
 * with foreign-key enforcement off. The file is written to be safe on a
 * populated database: rows are moved to a legacy owner that it creates
 * only when there is data to own.
 */
async function applyTenancyIfMissing(): Promise<void> {
  const columns = await client.execute("pragma table_info(attempts)");
  if (columns.rows.some((row) => row.name === "user_id")) return;

  const file = path.join(process.cwd(), "drizzle", "0002_multitenant.sql");
  if (!fs.existsSync(file)) {
    throw new Error(
      "Q86 bootstrap: this database predates multi-tenancy and " +
        "drizzle/0002_multitenant.sql is missing, so it cannot be converted.",
    );
  }
  const statements = fs
    .readFileSync(file, "utf8")
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  await client.migrate(statements);
  console.log(
    `Q86 bootstrap: multi-tenancy applied (${statements.length} statements). ` +
      "Existing data belongs to the legacy owner account — claim it with " +
      "`pnpm claim-owner`.",
  );
}
