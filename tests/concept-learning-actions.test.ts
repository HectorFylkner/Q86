import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";

test("concept commitments log hints, corrections, unknowns, and exact remediation", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-concept-action-"));
  const databasePath = path.join(tempDir, "q86.db");
  const previousUrl = process.env.TURSO_DATABASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.TURSO_DATABASE_URL = `file:${databasePath}`;
  process.env.NODE_ENV = "test";
  let closeAppClient: (() => void) | null = null;

  t.after(async () => {
    closeAppClient?.();
    await rm(tempDir, { recursive: true, force: true });
    if (previousUrl == null) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousUrl;
    if (previousNodeEnv == null) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  });

  const migrationClient = createClient({ url: `file:${databasePath}` });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  migrationClient.close();

  const { db, client } = await import("../lib/db/index.ts");
  closeAppClient = () => client.close();
  const {
    assistanceEvents,
    conceptLearningAttempts,
    conceptRemediations,
  } = await import("../lib/db/schema.ts");
  const { finalizeConceptItem } = await import(
    "../lib/concept-learning-actions.ts"
  );
  const { PROBABILITY_AT_LEAST_ONE_SEGMENT: segment } = await import(
    "../curriculum/v3/segments/probability-at-least-one.ts"
  );

  const example = segment.examples[0];
  const corrected = await finalizeConceptItem({
    conceptId: segment.conceptId,
    itemUid: example.id,
    itemKind: "example",
    itemContentVersion: segment.contentVersion,
    originalAnswer: "1/2",
    originalMethod: "Use the complement",
    declaredUnknown: false,
    correction: "91/216",
    highestHintLevel: 2,
    timeSeconds: 64.5,
  });
  assert.equal(corrected.error, null);
  assert.equal(corrected.initialCorrect, false);
  assert.equal(corrected.finalCorrect, true);
  assert.equal(corrected.remediationCreated, true);
  assert.match(corrected.solutionMd, /complement/i);
  assert.ok(corrected.attemptId);

  const storedAttempt = await db
    .select()
    .from(conceptLearningAttempts)
    .where(eq(conceptLearningAttempts.id, corrected.attemptId!))
    .get();
  assert.ok(storedAttempt);
  assert.equal(storedAttempt.originalAnswer, "1/2");
  assert.equal(storedAttempt.originalMethod, "Use the complement");
  assert.equal(storedAttempt.highestHintLevel, 2);
  assert.equal(storedAttempt.correction, "91/216");
  assert.equal(storedAttempt.initialCorrect, false);
  assert.equal(storedAttempt.finalCorrect, true);

  const events = await db
    .select()
    .from(assistanceEvents)
    .where(eq(assistanceEvents.learningAttemptId, corrected.attemptId!))
    .all();
  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => [event.kind, event.hintLevel]),
    [
      ["hint_opened", 1],
      ["hint_opened", 2],
      ["worked_solution_revealed", null],
    ],
  );
  const remediation = await db
    .select()
    .from(conceptRemediations)
    .where(eq(conceptRemediations.sourceLearningAttemptId, corrected.attemptId!))
    .get();
  assert.ok(remediation);
  assert.equal(remediation.trigger, "hinted");
  assert.equal(remediation.actionTargetId, segment.conceptId);

  const check = segment.checks[0];
  const unknown = await finalizeConceptItem({
    conceptId: segment.conceptId,
    itemUid: check.id,
    itemKind: "check",
    itemContentVersion: segment.contentVersion,
    originalAnswer: null,
    originalMethod: null,
    declaredUnknown: true,
    correction: null,
    highestHintLevel: 0,
    timeSeconds: 11,
  });
  assert.equal(unknown.error, null);
  assert.equal(unknown.initialCorrect, false);
  assert.equal(unknown.finalCorrect, false);
  assert.equal(unknown.remediationCreated, true);
  const unknownAttempt = await db
    .select()
    .from(conceptLearningAttempts)
    .where(eq(conceptLearningAttempts.id, unknown.attemptId!))
    .get();
  assert.ok(unknownAttempt?.declaredUnknown);
});
