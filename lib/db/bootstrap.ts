import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { client, db } from "./index.ts";
import { loadBank, readBank, verifiedSeedCount } from "./seed-bank.ts";

/**
 * Self-provisioning: on a fresh database (local file or a brand-new Turso
 * instance) the first server boot applies the schema and loads the
 * committed 180-question bank, so deploying never requires terminal
 * steps. Databases created earlier via `pnpm db:push` are left to the
 * scripts (they have no migration ledger to build on), and every step is
 * idempotent, so repeated cold starts are safe.
 */
let ready: Promise<void> | null = null;

export function ensureDbReady(): Promise<void> {
  ready ??= provision().catch((e) => {
    ready = null; // allow the next request to retry
    throw e;
  });
  return ready;
}

async function provision(): Promise<void> {
  const existing = await client.execute(
    "select name from sqlite_master where type = 'table' and name = 'questions'",
  );
  const hasTables = existing.rows.length > 0;

  if (!hasTables) {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    console.log("Q86 bootstrap: schema applied to empty database.");
  }

  const bankSize = readBank().questions.length;
  if ((await verifiedSeedCount()) < bankSize) {
    const { inserted, updated, retired } = await loadBank();
    console.log(
      `Q86 bootstrap: seed bank loaded (${inserted} inserted, ${updated} refreshed, ${retired} retired).`,
    );
  }
}
