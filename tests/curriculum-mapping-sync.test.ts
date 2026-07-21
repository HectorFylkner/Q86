import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

test("reviewed pilot question mappings sync idempotently by stable identity", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-mapping-sync-"));
  const databasePath = path.join(tempDir, "q86.db");
  const previousUrl = process.env.TURSO_DATABASE_URL;
  process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
  let closeAppClient: (() => void) | null = null;

  t.after(async () => {
    closeAppClient?.();
    await rm(tempDir, { recursive: true, force: true });
    if (previousUrl == null) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousUrl;
  });

  const migrationClient = createClient({ url: `file:${databasePath}` });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  migrationClient.close();

  const { db, client } = await import("../lib/db/index.ts");
  closeAppClient = () => client.close();
  const { questionConceptMappings } = await import("../lib/db/schema.ts");
  const { loadBank } = await import("../lib/db/seed-bank.ts");
  const { syncCurriculumV3Mappings } = await import(
    "../lib/db/curriculum-mappings.ts"
  );
  const { buildQuestionMappings } = await import(
    "../curriculum/v3/coverage.ts"
  );
  const { buildCurriculumV3 } = await import("../curriculum/v3/graph.ts");

  const loaded = await loadBank();
  assert.equal(loaded.inserted, 603);
  const expected = buildQuestionMappings(buildCurriculumV3()).filter(
    (mapping) =>
      mapping.status === "mapped" &&
      mapping.mappingConfidence === "curated_rule",
  );
  const expectedRows = expected.reduce(
    (total, mapping) => total + 1 + mapping.secondaryConceptIds.length,
    0,
  );

  const first = await syncCurriculumV3Mappings();
  assert.equal(first.mappedQuestions, expected.length);
  assert.equal(first.desiredRows, expectedRows);
  assert.equal(first.insertedRows, expectedRows);
  const second = await syncCurriculumV3Mappings();
  assert.equal(second.insertedRows, 0);

  const stored = await db.select().from(questionConceptMappings).all();
  assert.equal(stored.length, expectedRows);
  assert.equal(
    stored.filter((row) => row.role === "primary").length,
    expected.length,
  );
  assert.ok(stored.every((row) => row.editorialState === "reviewed"));
  assert.ok(stored.every((row) => row.questionUid.length > 0));
});
