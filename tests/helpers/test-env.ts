import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Import this FIRST in any test that touches the database. It points
 * `lib/db/index.ts` at a private SQLite file before that module's
 * top-level `createClient()` runs, so every test file gets an
 * independent database with no code change in the application.
 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "q86-test-"));
export const TEST_DB_PATH = path.join(dir, `${randomUUID()}.db`);

process.env.TURSO_DATABASE_URL = `file:${TEST_DB_PATH}`;
delete process.env.TURSO_AUTH_TOKEN;
(process.env as Record<string, string>).NODE_ENV = "test";
