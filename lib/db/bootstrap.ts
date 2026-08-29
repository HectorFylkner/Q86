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
 * Self-provisioning: the first server boot brings the database to the
 * current schema and loads the committed question bank, so deploying never
 * requires a terminal step. Every step is idempotent, so repeated cold
 * starts are safe.
 *
 * Three shapes arrive here, and all three end up on the same path:
 *
 *   Empty — run every migration.
 *   Created by a previous boot — it has drizzle's ledger, so run the
 *     migrations it has not seen. This is what applies each new milestone's
 *     schema to a running deployment.
 *   Created by `pnpm db:push` — no ledger to build on. Guarded DDL brings
 *     it to the shape migration 0001 leaves behind, the ledger is then
 *     stamped with 0000 and 0001, and it joins the normal path. Adopting
 *     the ledger once is what stops this branch from having to mirror
 *     every future migration by hand.
 */
let ready: Promise<void> | null = null;

export function ensureDbReady(): Promise<void> {
  ready ??= provision().catch((e) => {
    ready = null; // allow the next request to retry
    throw e;
  });
  return ready;
}

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

async function tableExists(name: string): Promise<boolean> {
  const found = await client.execute({
    sql: "select name from sqlite_master where type = 'table' and name = ?",
    args: [name],
  });
  return found.rows.length > 0;
}

/**
 * Which migrations a ledger-less database already satisfies, judged by the
 * tables each one introduced.
 *
 * A `db:push` database can be at any point in the schema's history: one
 * created before accounts existed is at 0001, and one created by running
 * `pnpm db:push` against today's schema.ts is at the head. Stamping the
 * wrong point is what turns a deploy into a crash loop — replaying 0002
 * against tables that already exist fails with "table `users` already
 * exists", which is exactly what the old Docker entrypoint produced.
 */
const MIGRATION_MARKERS: Array<{ idx: number; table: string }> = [
  { idx: 2, table: "users" },
  { idx: 3, table: "subscriptions" },
  { idx: 4, table: "access_grants" },
  { idx: 5, table: "api_usage" },
];

async function alreadySatisfied(): Promise<number> {
  // 0000 and 0001 are implied by `questions` existing at all, which the
  // caller has already checked.
  let highest = 1;
  for (const marker of MIGRATION_MARKERS) {
    if (await tableExists(marker.table)) highest = marker.idx;
    else break;
  }
  return highest;
}

async function provision(): Promise<void> {
  const hasTables = await tableExists("questions");
  const hasLedger = await tableExists("__drizzle_migrations");

  if (hasTables && !hasLedger) {
    await adoptLedger(await alreadySatisfied());
  }

  const before = hasTables ? await appliedMigrationCount() : 0;
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  const after = await appliedMigrationCount();
  if (after > before) {
    console.log(
      hasTables
        ? `Q86 bootstrap: applied ${after - before} migration(s).`
        : "Q86 bootstrap: schema applied to empty database.",
    );
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

async function appliedMigrationCount(): Promise<number> {
  if (!(await tableExists("__drizzle_migrations"))) return 0;
  const row = await client.execute(
    "select count(*) as n from __drizzle_migrations",
  );
  return Number(row.rows[0].n);
}

/**
 * Give a ledger-less database (one created by `pnpm db:push`) a migration
 * ledger, so `migrate()` can continue from wherever its schema already is.
 *
 * `throughIdx` is the newest migration the existing tables already
 * satisfy. Getting it wrong in either direction is a crash: too low
 * replays a migration against tables that exist, too high skips one that
 * is genuinely missing.
 *
 * Called once per database; after it, this branch never runs again.
 */
async function adoptLedger(throughIdx: number): Promise<void> {
  // The DDL below brings a *pre-accounts* database up to the shape
  // migration 0001 leaves behind. A database already past that point
  // (someone ran `pnpm db:push` against today's schema) needs none of it,
  // and running it there would be, at best, a series of no-ops against
  // tables of a different shape.
  if (throughIdx <= 1) {
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

  await client.execute(`create table if not exists __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at numeric
  )`);
  const journal = JSON.parse(
    fs.readFileSync(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8"),
  ) as { entries: Array<{ idx: number; when: number; tag: string }> };
  // Stamp every migration the existing schema already satisfies, so
  // `migrate()` applies only what is genuinely missing. For a database
  // from before accounts existed that is 0000 and 0001, which is the
  // shape the DDL above reaches; for one someone pushed today it is the
  // whole journal, and migrate() then has nothing to do.
  for (const entry of journal.entries.filter((e) => e.idx <= throughIdx)) {
    await client.execute({
      sql: "insert into __drizzle_migrations (hash, created_at) values (?, ?)",
      args: [entry.tag, entry.when],
    });
  }
  console.log(
    `Q86 bootstrap: adopted the migration ledger for a db:push database ` +
      `(through migration ${String(throughIdx).padStart(4, "0")}).`,
  );
}

