import "../helpers/test-env.ts";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { client } from "@/lib/db";
import { ensureDbReady } from "@/lib/db/bootstrap";

/**
 * The upgrade path that matters most: a database created by
 * `pnpm db:push` before accounts existed, booted by a deployment that has
 * since gained multi-tenancy and billing. It has no migration ledger, so
 * the bootstrap has to build one before it can catch up — and it must not
 * lose the history it already holds.
 */

const ROOT = process.cwd();

async function applyRaw(file: string): Promise<void> {
  const sql = fs
    .readFileSync(path.join(ROOT, "drizzle", file), "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of sql) await client.execute(statement);
}

async function tables(): Promise<string[]> {
  const rows = await client.execute(
    "select name from sqlite_master where type = 'table' order by name",
  );
  return rows.rows.map((r) => String(r.name));
}

describe("bootstrapping a ledger-less database from before accounts", () => {
  beforeAll(async () => {
    // The 0000 shape only: no deck_reviews, no question_flags, no ledger —
    // exactly what `pnpm db:push` produced at that point in the project.
    await applyRaw("0000_sleepy_kree.sql");
    await client.execute(`insert into questions
      (id, source, format, content_domain, context, fundamental_skill,
       subtopic, difficulty, stem_md, choices, correct_index, solution_md,
       fastest_path_md, trap_map, verified)
      values (1,'seed','problem_solving','arithmetic','pure',
       'value_order_factors','prime_factorization',3,'Old bank question',
       '["1","2","3","4","5"]',2,'sol','fast','{}',1)`);
    await client.execute(
      `insert into sessions (id, mode, config) values (1,'drill','{}')`,
    );
    await client.execute(
      `insert into attempts (id, question_id, session_id, mode, focus,
        selected_index, correct, time_seconds, confidence, user_notes)
       values (1,1,1,'drill','focused',2,1,88.5,'lock','history worth keeping')`,
    );
    await client.execute(
      `insert into settings (key, value) values ('test_date','2026-05-05'),
        ('seed_progress','180')`,
    );

    expect(await tables()).not.toContain("__drizzle_migrations");

    await ensureDbReady();
  });

  it("reaches the current schema", async () => {
    const names = await tables();
    for (const table of [
      "users",
      "auth_sessions",
      "auth_accounts",
      "auth_tokens",
      "app_settings",
      "subscriptions",
      "stripe_events",
      "deck_reviews",
      "question_flags",
      "__drizzle_migrations",
    ]) {
      expect({ table, present: names.includes(table) }).toEqual({
        table,
        present: true,
      });
    }
  });

  it("keeps the history it already held, and gives it an owner", async () => {
    const attempt = await client.execute("select * from attempts");
    expect(attempt.rows).toHaveLength(1);
    expect(attempt.rows[0].user_notes).toBe("history worth keeping");
    expect(attempt.rows[0].time_seconds).toBe(88.5);
    expect(attempt.rows[0].user_id).toBe("usr_legacy_owner");

    const owner = await client.execute("select * from users");
    expect(owner.rows).toHaveLength(1);
    expect(owner.rows[0].role).toBe("admin");
  });

  it("splits the settings it held between account and instance", async () => {
    const perUser = await client.execute("select key from settings");
    expect(perUser.rows.map((r) => r.key)).toEqual(["test_date"]);
    const app = await client.execute("select key, value from app_settings");
    expect(app.rows.map((r) => r.key)).toContain("seed_progress");
  });

  it("loads the committed bank on the way through", async () => {
    const verified = await client.execute(
      "select count(*) as n from questions where verified = 1",
    );
    // The bank is 360 items; the one pre-existing row is retired because
    // its stem is not in the bank, so the count is the bank size.
    expect(Number(verified.rows[0].n)).toBeGreaterThan(300);
  });

  it("adopts the ledger so the next boot is a plain migrate()", async () => {
    const ledger = await client.execute(
      "select hash from __drizzle_migrations order by created_at",
    );
    expect(ledger.rows.length).toBeGreaterThanOrEqual(4);
    expect(ledger.rows.map((r) => r.hash).slice(0, 2)).toEqual([
      "0000_sleepy_kree",
      "0001_deep_talon",
    ]);
    // No foreign keys were broken on the way.
    const violations = await client.execute("pragma foreign_key_check");
    expect(violations.rows).toEqual([]);
  });
});
