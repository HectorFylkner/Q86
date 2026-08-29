import "../helpers/test-env.ts";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { client, db } from "@/lib/db";
import { ensureDbReady } from "@/lib/db/bootstrap";
import { users, subscriptions, apiUsage, accessGrants } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * The other `db:push` case, and the one that actually broke a deployment:
 * a database pushed against *today's* schema, with every table already
 * present and still no migration ledger.
 *
 * The old Docker entrypoint produced exactly this — it ran `pnpm db:push`
 * and then started the server — and the boot crashed with
 * "table `users` already exists", because the ledger was stamped at 0001
 * and `migrate()` then replayed 0002 against tables that existed. A
 * container in that state crash-loops; there is no request that recovers
 * it.
 *
 * The entrypoint no longer runs `db:push`, but the script is still
 * documented and a person can still run it, so the boot path has to
 * survive it.
 */

/**
 * A database at today's schema with no migration ledger — which is what
 * `drizzle-kit push` leaves behind.
 *
 * Built by applying every migration and then dropping the ledger, rather
 * than by hand-writing the tables: hand-written DDL drifts from the real
 * schema the moment a migration is added, and a fixture that is subtly
 * wrong tests the wrong thing.
 */
async function pushCurrentSchema(): Promise<void> {
  const folder = path.join(process.cwd(), "drizzle");
  const journal = JSON.parse(
    fs.readFileSync(path.join(folder, "meta", "_journal.json"), "utf8"),
  ) as { entries: Array<{ tag: string }> };

  const statements: string[] = [];
  for (const entry of journal.entries) {
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
  // Foreign keys off for the batch, which 0002's table rebuilds need.
  await client.migrate(statements);

  // The ledger is the one thing db:push does not leave behind.
  await client.execute("drop table if exists __drizzle_migrations");
}

beforeAll(async () => {
  await pushCurrentSchema();
  await ensureDbReady();
});

describe("a db:push database at the current schema", () => {
  it("boots instead of crash-looping", async () => {
    // Reaching this point is the assertion: `ensureDbReady()` threw in
    // beforeAll before the fix, and every test in the file failed with it.
    const row = await db.get<{ n: number }>(
      sql`select count(*) as n from __drizzle_migrations`,
    );
    expect(row?.n).toBeGreaterThan(0);
  });

  it("stamps the ledger at the head rather than replaying old migrations", async () => {
    const rows = await db.all<{ hash: string }>(
      sql`select hash from __drizzle_migrations order by id`,
    );
    // Every migration in the journal, because the schema already
    // satisfies all of them.
    expect(rows.length).toBe(6);
    expect(rows.map((r) => r.hash)).toContain("0002_multitenant");
    expect(rows.map((r) => r.hash)).toContain("0005_operations");
  });

  it("still loads the question bank", async () => {
    const row = await db.get<{ n: number }>(
      sql`select count(*) as n from questions where verified = 1`,
    );
    expect(row?.n).toBeGreaterThan(300);
  });

  it("leaves a schema the application can actually use", async () => {
    // A ledger stamped at the wrong point can leave the tables one
    // migration behind what the code expects, which fails at the first
    // query rather than at boot. These are the four the later migrations
    // introduced.
    await expect(db.select().from(users).all()).resolves.toBeDefined();
    await expect(db.select().from(subscriptions).all()).resolves.toBeDefined();
    await expect(db.select().from(accessGrants).all()).resolves.toBeDefined();
    await expect(db.select().from(apiUsage).all()).resolves.toBeDefined();
  });

  it("is idempotent: a second boot changes nothing", async () => {
    const before = await db.get<{ n: number }>(
      sql`select count(*) as n from __drizzle_migrations`,
    );
    await ensureDbReady();
    const after = await db.get<{ n: number }>(
      sql`select count(*) as n from __drizzle_migrations`,
    );
    expect(after?.n).toBe(before?.n);
  });
});
