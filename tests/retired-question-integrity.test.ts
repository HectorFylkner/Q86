import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { count, eq } from "drizzle-orm";

test("retired questions leave training data and cannot start a redo", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-retired-test-"));
  const previousUrl = process.env.TURSO_DATABASE_URL;
  process.env.TURSO_DATABASE_URL = `file:${path.join(tempDir, "q86.db")}`;

  let closeClient: (() => void) | null = null;
  t.after(async () => {
    closeClient?.();
    await rm(tempDir, { recursive: true, force: true });
    if (previousUrl == null) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousUrl;
  });

  const { ensureDbReady } = await import("../lib/db/bootstrap.ts");
  const { client, db } = await import("../lib/db/index.ts");
  closeClient = () => client.close();
  const { attempts, questions, redoQueue, sessions } = await import(
    "../lib/db/schema.ts"
  );
  const { gatherAnalytics } = await import("../lib/analytics.ts");
  const { todaysDeck } = await import("../lib/deck.ts");
  const { computeLadders } = await import("../lib/mastery.ts");
  const { dueRedoCount, gatherPlanInputs } = await import(
    "../lib/plan-server.ts"
  );
  const { createRedoSession } = await import("../lib/redo.ts");

  await ensureDbReady();

  const question = await db
    .select()
    .from(questions)
    .where(eq(questions.verified, true))
    .limit(1)
    .get();
  assert.ok(question);

  const session = await db
    .insert(sessions)
    .values({ mode: "drill", config: {} })
    .returning()
    .get();
  const attempt = await db
    .insert(attempts)
    .values({
      questionId: question.id,
      sessionId: session.id,
      mode: "drill",
      focus: "focused",
      selectedIndex: (question.correctIndex + 1) % question.choices.length,
      correct: false,
      timeSeconds: 90,
      confidence: "lean",
    })
    .returning()
    .get();
  await db
    .insert(redoQueue)
    .values({
      questionId: question.id,
      sourceAttemptId: attempt.id,
      stage: 0,
      dueAt: new Date(Date.now() - 1_000),
    })
    .run();
  await db
    .update(questions)
    .set({ verified: false })
    .where(eq(questions.id, question.id))
    .run();

  const analytics = await gatherAnalytics();
  assert.equal(analytics.attemptCount, 0);
  assert.deepEqual(analytics.redoCompliance, {
    open: 0,
    overdue: 0,
    cleared: 0,
    dueNow: 0,
  });

  const planInputs = await gatherPlanInputs();
  assert.equal(planInputs.skillAccuracy[question.fundamentalSkill].total, 0);
  assert.equal(await dueRedoCount(), 0);

  const ladder = (await computeLadders()).find(
    (candidate) => candidate.subtopic === question.subtopic,
  );
  assert.ok(ladder);
  assert.equal(
    ladder.rungs.find((rung) => rung.difficulty === question.difficulty)?.total,
    0,
  );

  const deck = await todaysDeck();
  assert.equal(deck.cards.some((card) => card.questionId === question.id), false);

  const sessionCountBefore =
    (await db.select({ value: count() }).from(sessions).get())?.value ?? 0;
  const redo = await createRedoSession([question.id]);
  assert.ok(redo.error);
  assert.equal(redo.sessionId, null);
  assert.deepEqual(redo.questions, []);
  const sessionCountAfter =
    (await db.select({ value: count() }).from(sessions).get())?.value ?? 0;
  assert.equal(sessionCountAfter, sessionCountBefore);
});
