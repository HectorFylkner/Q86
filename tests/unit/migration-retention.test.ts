import "../helpers/test-env.ts";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import os from "node:os";

/**
 * The 0004 migration against a database that already has accounts, rows
 * and a subscription — not against an empty one, which is the only
 * interesting case for an additive migration.
 */
describe("0004_retention against a populated database", () => {
  it("adds without touching a single existing row", async () => {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "q86-mig-")),
      "pre-m5.db",
    );
    const client = createClient({ url: `file:${file}` });
    const db = drizzle(client);

    // Apply everything up to and including 0003 — the pre-M5 schema —
    // the way the migrator does, then stamp the ledger so `migrate()`
    // applies 0004 and only 0004.
    const folder = path.join(process.cwd(), "drizzle");
    const journal = JSON.parse(
      fs.readFileSync(path.join(folder, "meta", "_journal.json"), "utf8"),
    ) as { entries: Array<{ idx: number; when: number; tag: string }> };
    const before = journal.entries.filter((e) => e.idx < 4);

    const statements: string[] = [];
    for (const entry of before) {
      statements.push(
        ...fs
          .readFileSync(path.join(folder, `${entry.tag}.sql`), "utf8")
          .split("--> statement-breakpoint")
          .map((chunk) =>
            chunk
              .split("\n")
              .filter((line) => !line.trim().startsWith("--"))
              .join("\n")
              .trim(),
          )
          .filter((chunk) => chunk.length > 0),
      );
    }
    // `client.migrate` runs the batch with foreign keys off, which is what
    // 0002's table rebuilds need.
    await client.migrate(statements);

    await client.execute(
      `create table if not exists __drizzle_migrations (
         id integer primary key autoincrement,
         hash text not null,
         created_at numeric)`,
    );
    for (const entry of before) {
      await client.execute({
        sql: "insert into __drizzle_migrations (hash, created_at) values (?, ?)",
        // The journal's own timestamp, not now: drizzle decides what to
        // apply by comparing `when` against the newest `created_at`, so
        // stamping "now" would mark 0004 as already done.
        args: [entry.tag, entry.when],
      });
    }

    // Populate it the way a real deployment would be.
    await client.execute({
      sql: `insert into users (id, email, password_hash, name, locale, role)
            values (?, ?, ?, ?, ?, ?)`,
      args: ["usr_a", "a@exempel.se", "scrypt$1$1$1$aa$bb", "A", "sv", "user"],
    });
    await client.execute({
      sql: `insert into subscriptions (user_id, plan, status) values (?, ?, ?)`,
      args: ["usr_a", "monthly", "active"],
    });
    await client.execute({
      sql: `insert into settings (user_id, key, value) values (?, ?, ?)`,
      args: ["usr_a", "test_date", "2026-12-01"],
    });

    const countBefore = await client.execute("select count(*) as n from users");

    await migrate(db, { migrationsFolder: folder });

    const countAfter = await client.execute("select count(*) as n from users");
    expect(countAfter.rows[0].n).toBe(countBefore.rows[0].n);

    // The four new columns exist and are null on the existing row.
    const row = await client.execute(
      "select referral_code, referred_by, share_code, onboarded_at from users where id = 'usr_a'",
    );
    expect(row.rows[0]).toMatchObject({
      referral_code: null,
      referred_by: null,
      share_code: null,
      onboarded_at: null,
    });

    // The existing data is untouched.
    const setting = await client.execute(
      "select value from settings where user_id = 'usr_a' and key = 'test_date'",
    );
    expect(setting.rows[0].value).toBe("2026-12-01");
    const sub = await client.execute(
      "select plan, status from subscriptions where user_id = 'usr_a'",
    );
    expect(sub.rows[0]).toMatchObject({ plan: "monthly", status: "active" });

    // Both new tables are there and empty.
    for (const table of ["access_grants", "email_log"]) {
      const t = await client.execute(`select count(*) as n from ${table}`);
      expect(t.rows[0].n).toBe(0);
    }

    // Two accounts may both sit at a null code: the unique index must not
    // treat NULLs as equal, or the migration breaks every second account.
    await client.execute({
      sql: `insert into users (id, email, locale, role) values (?, ?, ?, ?)`,
      args: ["usr_b", "b@exempel.se", "sv", "user"],
    });
    const both = await client.execute(
      "select count(*) as n from users where referral_code is null",
    );
    expect(both.rows[0].n).toBe(2);

    const violations = await client.execute("pragma foreign_key_check");
    expect(violations.rows).toHaveLength(0);

    client.close();
  });
});
