/**
 * Convert a populated single-user Q86 database to the multi-tenant schema.
 *
 *   pnpm migrate:multitenant --dry-run    # report only, touches nothing
 *   pnpm migrate:multitenant              # back up, convert, verify
 *
 * The application converts itself on first boot (lib/db/bootstrap.ts), so
 * this script exists for the case that matters most: doing it deliberately,
 * on a copy, with the before/after counts in front of you. It refuses to
 * run without a backup it made itself.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const OWNED = [
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
];

const dryRun = process.argv.includes("--dry-run");
const remote = process.env.TURSO_DATABASE_URL;
const localPath = path.join(process.cwd(), "data", "q86.db");
const url = remote ?? `file:${localPath}`;

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function counts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const table of [...OWNED, "questions"]) {
    try {
      const r = await client.execute(`select count(*) as n from ${table}`);
      out[table] = Number(r.rows[0].n);
    } catch {
      out[table] = -1; // table absent
    }
  }
  return out;
}

function report(label: string, rows: Record<string, number>): void {
  console.log(`\n  ${label}`);
  for (const [table, n] of Object.entries(rows)) {
    console.log(`    ${table.padEnd(20)} ${n < 0 ? "(absent)" : n}`);
  }
}

async function alreadyConverted(): Promise<boolean> {
  const columns = await client.execute("pragma table_info(attempts)");
  return columns.rows.some((row) => row.name === "user_id");
}

async function main(): Promise<void> {
  console.log(`\n  Q86 multi-tenancy migration`);
  console.log(`  Target: ${remote ? "remote libSQL (TURSO_DATABASE_URL)" : localPath}`);

  if (await alreadyConverted()) {
    console.log("\n  Already multi-tenant — nothing to do.\n");
    return;
  }

  const before = await counts();
  report("Before:", before);

  const total = Object.entries(before)
    .filter(([table]) => table !== "questions")
    .reduce((sum, [, n]) => sum + Math.max(0, n), 0);
  console.log(
    `\n  ${total} user-owned rows would move to the legacy owner account` +
      " (usr_legacy_owner).",
  );

  if (dryRun) {
    console.log(
      "\n  --dry-run: nothing was written. Re-run without the flag to apply.\n",
    );
    return;
  }

  if (!remote) {
    const backup = `${localPath}.pre-multitenant-${Date.now()}.bak`;
    fs.copyFileSync(localPath, backup);
    console.log(`\n  Backup written: ${backup}`);
  } else {
    console.log(
      "\n  Remote database: take a Turso snapshot before continuing if you" +
        " have not already (this script cannot make one for you).",
    );
  }

  const statements = fs
    .readFileSync(path.join(process.cwd(), "drizzle", "0002_multitenant.sql"), "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  await client.migrate(statements);

  const after = await counts();
  report("After:", after);

  // `settings` legitimately shrinks: three instance-wide keys move to
  // app_settings. Everything else must match exactly.
  const problems: string[] = [];
  for (const [table, n] of Object.entries(before)) {
    if (table === "settings") continue;
    if (after[table] !== n) {
      problems.push(`${table}: ${n} → ${after[table]}`);
    }
  }
  const app = await client.execute("select count(*) as n from app_settings");
  const settingsTotal = after.settings + Number(app.rows[0].n);
  if (before.settings >= 0 && settingsTotal !== before.settings) {
    problems.push(
      `settings: ${before.settings} → ${after.settings} + ${app.rows[0].n} in app_settings`,
    );
  }

  const orphans: string[] = [];
  for (const table of OWNED) {
    if (after[table] <= 0) continue;
    const r = await client.execute(
      `select count(*) as n from ${table} where user_id is null or user_id = ''`,
    );
    if (Number(r.rows[0].n) > 0) orphans.push(`${table}: ${r.rows[0].n}`);
  }

  const fk = await client.execute("pragma foreign_key_check");

  console.log("");
  if (problems.length === 0 && orphans.length === 0 && fk.rows.length === 0) {
    console.log("  ✓ Row counts preserved, every row owned, no FK violations.");
    console.log(
      "\n  Next: claim the migrated account —" +
        "\n    pnpm claim-owner --email=you@example.com --password='…'\n",
    );
  } else {
    console.error("  ✗ Verification failed:");
    for (const p of [...problems, ...orphans]) console.error(`    ${p}`);
    if (fk.rows.length > 0) {
      console.error(`    ${fk.rows.length} foreign-key violations`);
    }
    console.error("\n  Restore from the backup above before using this database.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
