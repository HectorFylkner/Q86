/** Snapshot ./data (attempt history, ELO, scratch photos) into ./backups.
 *
 *   pnpm backup            → backups/q86-<timestamp>/
 *   pnpm backup /some/dir  → /some/dir/q86-<timestamp>/
 *
 * The SQLite file is copied with better-sqlite3's online backup API, so it
 * is safe to run while the app is serving. Nothing is ever deleted.
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "q86.db");
const SCRATCH_DIR = path.join(DATA_DIR, "scratch");

if (!fs.existsSync(DB_PATH)) {
  console.error(`No database at ${DB_PATH} — nothing to back up.`);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
const destRoot = process.argv[2] ?? path.join(process.cwd(), "backups");
const dest = path.join(destRoot, `q86-${stamp}`);
fs.mkdirSync(dest, { recursive: true });

const db = new Database(DB_PATH, { readonly: true });
await db.backup(path.join(dest, "q86.db"));
db.close();

let images = 0;
if (fs.existsSync(SCRATCH_DIR)) {
  fs.cpSync(SCRATCH_DIR, path.join(dest, "scratch"), { recursive: true });
  images = fs.readdirSync(SCRATCH_DIR).length;
}

const size = fs.statSync(path.join(dest, "q86.db")).size;
console.log(
  `Backed up q86.db (${(size / 1024).toFixed(0)} kB) and ${images} scratch image(s) to ${dest}`,
);
