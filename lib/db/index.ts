import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

const DATA_DIR = path.join(process.cwd(), "data");
const SCRATCH_DIR = path.join(DATA_DIR, "scratch");
const DB_PATH = path.join(DATA_DIR, "q86.db");

type DB = BetterSQLite3Database<typeof schema>;

// Keep a single connection across Next.js hot reloads.
const globalForDb = globalThis as unknown as { __q86db?: DB };

function createDb(): DB {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db: DB = globalForDb.__q86db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__q86db = db;

export { schema, SCRATCH_DIR, DATA_DIR };
