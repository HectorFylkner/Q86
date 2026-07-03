/** Snapshot the local database into ./backups.
 *
 *   pnpm backup            → backups/q86-<timestamp>/q86.db
 *   pnpm backup /some/dir  → /some/dir/q86-<timestamp>/q86.db
 *
 * Uses SQLite's VACUUM INTO, so the copy is consistent even while the app
 * is serving. Nothing is ever deleted. With TURSO_DATABASE_URL set the
 * data lives in Turso, which keeps its own point-in-time backups — this
 * script only handles the local file. Scratch images live inside the
 * database, so the single file is the complete backup.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

if (process.env.TURSO_DATABASE_URL) {
  console.log(
    "TURSO_DATABASE_URL is set — your data lives in Turso, which keeps its own backups (turso db list / point-in-time restore). Nothing to do locally.",
  );
  process.exit(0);
}

const DB_PATH = path.join(process.cwd(), "data", "q86.db");

if (!fs.existsSync(DB_PATH)) {
  console.error(`No database at ${DB_PATH} — nothing to back up.`);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
const destRoot = process.argv[2] ?? path.join(process.cwd(), "backups");
const dest = path.join(destRoot, `q86-${stamp}`);
fs.mkdirSync(dest, { recursive: true });
const destFile = path.join(dest, "q86.db");

const client = createClient({ url: `file:${DB_PATH}` });
await client.execute(`VACUUM INTO '${destFile.replaceAll("'", "''")}'`);
client.close();

const size = fs.statSync(destFile).size;
console.log(`Backed up q86.db (${(size / 1024).toFixed(0)} kB) to ${dest}`);
