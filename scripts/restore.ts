/** Restore the local database from a backup taken by `pnpm backup`.
 *
 *   pnpm restore backups/q86-2026-08-29T12-00-00/q86.db
 *   pnpm restore <file> --force   # overwrite without the prompt
 *
 * The current database is never overwritten silently: unless --force is
 * given, this refuses if data/q86.db exists, and it always moves the
 * existing file aside rather than deleting it. A restore that destroys the
 * thing you were about to compare against is not a restore.
 *
 * With TURSO_DATABASE_URL set this refuses outright — Turso restores are a
 * point-in-time operation on Turso's side, and a local file copy would be
 * a different database wearing the same name.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

async function main(): Promise<void> {
  if (process.env.TURSO_DATABASE_URL) {
    console.error(
      "TURSO_DATABASE_URL is set. Restore through Turso " +
        "(`turso db restore <name> --timestamp ...`), not through this " +
        "script: copying a local file over a hosted database would leave " +
        "the two disagreeing.",
    );
    process.exitCode = 2;
    return;
  }

  const source = process.argv[2];
  const force = process.argv.includes("--force");
  if (!source) {
    console.error("Usage: pnpm restore <backup.db> [--force]");
    process.exitCode = 2;
    return;
  }
  if (!fs.existsSync(source)) {
    console.error(`No such file: ${source}`);
    process.exitCode = 1;
    return;
  }

  // Verify the backup before touching anything: restoring a corrupt file
  // over a working database is the worst outcome available here.
  const probe = createClient({ url: `file:${path.resolve(source)}` });
  try {
    const integrity = await probe.execute("pragma integrity_check");
    const verdict = String(integrity.rows[0]?.integrity_check ?? "");
    if (verdict !== "ok") {
      console.error(`Backup failed integrity_check: ${verdict}`);
      process.exitCode = 1;
      return;
    }
    // An empty file is a valid SQLite database and passes
    // integrity_check, so integrity alone is not enough: a zero-table
    // file is never a backup anyone meant to restore.
    const tables = await probe.execute(
      "select count(*) as n from sqlite_master where type = 'table' " +
        "and name not like 'sqlite_%'",
    );
    if (Number(tables.rows[0].n) === 0) {
      console.error(
        `${source} contains no tables. That is an empty database, not a ` +
          "backup — refusing rather than replacing a working one with it.",
      );
      process.exitCode = 1;
      return;
    }
    console.log(
      `Backup passes integrity_check and holds ${tables.rows[0].n} table(s).`,
    );

    // Row counts are informational, and a backup old enough to predate a
    // table is still a valid backup — so a missing table is reported, not
    // fatal. Integrity is the gate; the counts are the sanity check.
    for (const table of ["users", "attempts", "questions"]) {
      try {
        const count = await probe.execute(`select count(*) as n from ${table}`);
        console.log(`  ${table}: ${count.rows[0].n}`);
      } catch {
        console.log(`  ${table}: absent (a backup from before this table)`);
      }
    }
  } finally {
    probe.close();
  }

  const target = path.join(process.cwd(), "data", "q86.db");
  fs.mkdirSync(path.dirname(target), { recursive: true });

  if (fs.existsSync(target)) {
    if (!force) {
      console.error(
        `${target} already exists. Re-run with --force to replace it; the ` +
          "existing file will be moved aside, not deleted.",
      );
      process.exitCode = 1;
      return;
    }
    const aside = `${target}.replaced-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`;
    fs.renameSync(target, aside);
    console.log(`Moved the existing database to ${aside}`);
  }

  fs.copyFileSync(source, target);
  console.log(`Restored ${source} → ${target}`);
  console.log(
    "Start the app to let the bootstrap apply any pending migrations.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
