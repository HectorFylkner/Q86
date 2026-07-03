import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.ts";

/**
 * One driver, two homes. Locally (and on any host with a disk) the
 * database is a plain SQLite file under ./data — local-first, no
 * accounts, no cloud. Set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) and
 * the same code talks to a hosted libSQL database instead, which is
 * what serverless deployments (Vercel) use.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "q86.db");

type DB = LibSQLDatabase<typeof schema>;

// Keep a single connection across Next.js hot reloads.
const globalForDb = globalThis as unknown as {
  __q86db?: DB;
  __q86client?: Client;
};

function createDbClient(): Client {
  // Some hosting integrations inject DATABASE_URL instead; accept it when
  // it is a libsql URL so marketplace-provisioned databases work unedited.
  const remoteUrl =
    process.env.TURSO_DATABASE_URL ??
    (process.env.DATABASE_URL?.startsWith("libsql")
      ? process.env.DATABASE_URL
      : undefined);
  if (remoteUrl) {
    return createClient({
      url: remoteUrl,
      authToken:
        process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN,
    });
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return createClient({ url: `file:${DB_PATH}` });
}

const client: Client = globalForDb.__q86client ?? createDbClient();
export const db: DB = globalForDb.__q86db ?? drizzle(client, { schema });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__q86client = client;
  globalForDb.__q86db = db;
}

export { schema, client, DATA_DIR, DB_PATH };
