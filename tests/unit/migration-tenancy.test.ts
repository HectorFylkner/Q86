import "../helpers/test-env.ts";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { beforeAll, describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

/**
 * ADR 0001's migration, run against a copy of a populated single-user
 * database. The fixture is built by applying migrations 0000 and 0001 —
 * the exact shape a real Q86 install has today — and filling every
 * user-owned table with rows. 0002 then has to move all of them into one
 * owner account without losing or altering anything.
 */

const ROOT = process.cwd();
const OWNER = "usr_legacy_owner";

type Client = ReturnType<typeof createClient>;

/** Split a drizzle migration file the way the migrator does. */
function statementsOf(file: string): string[] {
  return fs
    .readFileSync(path.join(ROOT, "drizzle", file), "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function applyRaw(client: Client, file: string): Promise<void> {
  for (const statement of statementsOf(file)) {
    await client.execute(statement);
  }
}

/** Row counts per table, the invariant the migration must preserve. */
async function counts(client: Client): Promise<Record<string, number>> {
  const tables = [
    "sessions",
    "attempts",
    "edits",
    "redo_queue",
    "pattern_attempts",
    "elo_ratings",
    "baseline_reports",
    "deck_reviews",
    "question_flags",
    "questions",
  ];
  const out: Record<string, number> = {};
  for (const t of tables) {
    const r = await client.execute(`select count(*) as n from ${t}`);
    out[t] = Number(r.rows[0].n);
  }
  return out;
}

describe("0002 multi-tenancy migration against a populated database", () => {
  let client: Client;
  let before: Record<string, number>;
  let after: Record<string, number>;
  let dbFile: string;

  beforeAll(async () => {
    dbFile = path.join(
      fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "q86-mig-")),
      "populated.db",
    );
    client = createClient({ url: `file:${dbFile}` });

    // ---- Build the pre-migration fixture (schema as of 0001) ----------
    await applyRaw(client, "0000_sleepy_kree.sql");
    await applyRaw(client, "0001_deep_talon.sql");
    // Record them in drizzle's ledger, so the fixture is indistinguishable
    // from a database the app's own bootstrap provisioned before M1.
    await client.execute(
      `create table if not exists __drizzle_migrations (
         id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)`,
    );
    const journal = JSON.parse(
      fs.readFileSync(path.join(ROOT, "drizzle", "meta", "_journal.json"), "utf8"),
    ) as { entries: Array<{ idx: number; when: number; tag: string }> };
    for (const entry of journal.entries.filter((e) => e.idx < 2)) {
      await client.execute({
        sql: "insert into __drizzle_migrations (hash, created_at) values (?, ?)",
        args: [entry.tag, entry.when],
      });
    }

    await client.execute(`insert into questions
      (id, source, format, content_domain, context, fundamental_skill,
       subtopic, difficulty, stem_md, choices, correct_index, solution_md,
       fastest_path_md, trap_map, verified)
      values
      (1,'seed','problem_solving','arithmetic','pure','value_order_factors',
       'prime_factorization',3,'If n = 2^3 * 3^2, how many positive divisors?',
       '["6","8","10","12","14"]',3,'Divisor count is (3+1)(2+1)=12.',
       'Add one to each exponent and multiply.','{"0":"forgot the +1"}',1),
      (2,'seed','data_sufficiency','algebra','pure','equal_unequal_alg',
       'inequalities',4,'Is x > 0?','["A","B","C","D","E"]',0,
       'Statement 1 alone suffices.','Test signs.','{"1":"missed zero"}',1)`);

    await client.execute(
      `insert into sessions (id, mode, config, started_at, ended_at, summary)
       values (1,'drill','{"count":2}',1700000000000,1700000600000,'{"correct":1}'),
              (2,'section_sim','{"kind":"full"}',1700100000000,null,null)`,
    );
    await client.execute(
      `insert into attempts
        (id, question_id, session_id, mode, focus, selected_index, correct,
         time_seconds, confidence, error_type, user_notes, created_at)
       values (1,1,1,'drill','focused',3,1,74.5,'lock',null,'clean',1700000100000),
              (2,2,1,'drill','focused',2,0,180.25,'guess','concept','rushed',1700000300000),
              (3,1,2,'section_sim','casual',0,0,45.0,'unsure',null,null,1700100100000)`,
    );
    await client.execute(
      `insert into edits
        (id, session_id, question_id, from_index, to_index, from_correct,
         to_correct, reason, justification, created_at)
       values (1,1,2,2,0,0,1,'misread','I misread the second statement entirely.',1700000500000)`,
    );
    await client.execute(
      `insert into redo_queue (id, question_id, source_attempt_id, stage, due_at, cleared)
       values (1,2,2,1,1700600000000,0)`,
    );
    await client.execute(
      `insert into pattern_attempts
        (id, category, prompt_text, correct_answer, user_answer, ms, correct, created_at)
       values (1,'units_digit_cycles','7^23 units digit','3','3',4200,1,1700000900000),
              (2,'factor_counts','divisors of 36','9','8',9100,0,1700001000000)`,
    );
    await client.execute(
      `insert into elo_ratings (category, rating, updated_at)
       values ('units_digit_cycles',1264.5,1700001000000),
              ('factor_counts',1188.0,1700001000000)`,
    );
    await client.execute(
      `insert into baseline_reports (id, raw_text, parsed, created_at)
       values (1,'Quant 78 ...','{"quant":78}',1699000000000)`,
    );
    await client.execute(
      `insert into settings (key, value) values
        ('test_date','2026-11-14'),
        ('timed_set_cadence','3'),
        ('weight_overrides','{"rates_ratio_percent":1.4}'),
        ('model','claude-sonnet-4-6'),
        ('seed_progress','360'),
        ('user_retired_qids','[7,19]')`,
    );
    await client.execute(
      `insert into deck_reviews
        (question_id, ease, interval_days, reps, lapses, due_at, updated_at)
       values (2,2.36,6,3,1,1700700000000,1700001200000)`,
    );
    await client.execute(
      `insert into question_flags (id, question_id, reason, note, status, created_at)
       values (1,1,'ambiguous','Two readings of "positive".','open',1700001300000)`,
    );

    before = await counts(client);

    // ---- Run the migration exactly as the app would --------------------
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: path.join(ROOT, "drizzle") });

    after = await counts(client);
  });

  it("preserves every row in every table it does not split", () => {
    expect(after).toEqual(before);
  });

  it("splits settings without losing a key", async () => {
    // Six rows went in: three per-account preferences and three that
    // configure the instance. Both halves survive, in their new homes.
    const perUser = await client.execute("select count(*) as n from settings");
    const app = await client.execute("select count(*) as n from app_settings");
    expect(Number(perUser.rows[0].n) + Number(app.rows[0].n)).toBe(6);
    expect(Number(perUser.rows[0].n)).toBe(3);
    expect(Number(app.rows[0].n)).toBe(3);
  });

  it("creates exactly one legacy owner, with no password to sign in with", async () => {
    const rows = await client.execute("select * from users");
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].id).toBe(OWNER);
    expect(rows.rows[0].password_hash).toBeNull();
    expect(rows.rows[0].role).toBe("admin");
  });

  it("assigns every migrated row to that owner", async () => {
    for (const table of [
      "sessions",
      "attempts",
      "edits",
      "redo_queue",
      "pattern_attempts",
      "elo_ratings",
      "baseline_reports",
      "settings",
      "deck_reviews",
      "question_flags",
    ]) {
      const orphans = await client.execute(
        `select count(*) as n from ${table} where user_id is not '${OWNER}'`,
      );
      expect(`${table}:${orphans.rows[0].n}`).toBe(`${table}:0`);
    }
  });

  it("moves instance-wide keys out of per-account settings", async () => {
    const app = await client.execute("select key, value from app_settings order by key");
    expect(app.rows.map((r) => r.key)).toEqual([
      "model",
      "seed_progress",
      "user_retired_qids",
    ]);
    expect(app.rows.find((r) => r.key === "user_retired_qids")?.value).toBe("[7,19]");

    const perUser = await client.execute("select key from settings order by key");
    expect(perUser.rows.map((r) => r.key)).toEqual([
      "test_date",
      "timed_set_cadence",
      "weight_overrides",
    ]);
  });

  it("leaves question content byte-for-byte unchanged", async () => {
    const q = await client.execute("select * from questions order by id");
    expect(q.rows[0].stem_md).toBe(
      "If n = 2^3 * 3^2, how many positive divisors?",
    );
    expect(q.rows[0].choices).toBe('["6","8","10","12","14"]');
    expect(q.rows[0].correct_index).toBe(3);
    expect(q.rows[1].stem_md).toBe("Is x > 0?");
    expect(q.rows[1].correct_index).toBe(0);
    // `questions` must not have grown an owner: the bank is shared.
    const cols = await client.execute("pragma table_info(questions)");
    expect(cols.rows.map((r) => r.name)).not.toContain("user_id");
  });

  it("preserves the payloads that carry user history", async () => {
    const a = await client.execute("select * from attempts order by id");
    expect(a.rows.map((r) => r.time_seconds)).toEqual([74.5, 180.25, 45]);
    expect(a.rows.map((r) => r.focus)).toEqual(["focused", "focused", "casual"]);
    expect(a.rows[1].user_notes).toBe("rushed");

    const e = await client.execute("select * from edits");
    expect(e.rows[0].justification).toBe(
      "I misread the second statement entirely.",
    );

    const d = await client.execute("select * from deck_reviews");
    expect(d.rows[0].ease).toBe(2.36);
    expect(d.rows[0].question_id).toBe(2);

    const elo = await client.execute(
      "select rating from elo_ratings where category = 'units_digit_cycles'",
    );
    expect(elo.rows[0].rating).toBe(1264.5);
  });

  it("leaves referential integrity intact", async () => {
    const violations = await client.execute("pragma foreign_key_check");
    expect(violations.rows).toEqual([]);
  });

  it("is idempotent — re-running the migrator changes nothing", async () => {
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: path.join(ROOT, "drizzle") });
    expect(await counts(client)).toEqual(before);
    const users = await client.execute("select count(*) as n from users");
    expect(Number(users.rows[0].n)).toBe(1);
    const perUser = await client.execute("select count(*) as n from settings");
    expect(Number(perUser.rows[0].n)).toBe(3);
  });
});
