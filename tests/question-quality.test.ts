import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { eq } from "drizzle-orm";

const COMPLETE_ATTESTATIONS = {
  solvedIndependently: true,
  singleCorrectAnswer: true,
  explanationAndTrapsChecked: true,
} as const;

test("question QA only approves reviewed, non-retired model candidates", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-quality-test-"));
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
  const { questions, settings } = await import("../lib/db/schema.ts");
  const {
    applyModelQuarantineMigration,
    MODEL_QUARANTINE_MIGRATION_KEY,
  } = await import("../lib/db/model-quarantine.ts");
  const {
    approveModelCheckedCandidate,
    quarantinedQuestionCandidates,
  } = await import("../lib/quality.ts");

  await ensureDbReady();
  const seed = await db
    .select()
    .from(questions)
    .where(eq(questions.source, "seed"))
    .limit(1)
    .get();
  assert.ok(seed);

  const candidateValues = (source: "generated" | "twin", suffix: string) => ({
    source,
    format: seed.format,
    contentDomain: seed.contentDomain,
    context: seed.context,
    fundamentalSkill: seed.fundamentalSkill,
    subtopic: seed.subtopic,
    difficulty: seed.difficulty,
    stemMd: `${seed.stemMd}\n\nQA candidate ${suffix}`,
    choices: seed.choices,
    correctIndex: seed.correctIndex,
    solutionMd: seed.solutionMd,
    fastestPathMd: seed.fastestPathMd,
    trapMap: seed.trapMap,
    numericCheck: seed.numericCheck,
    verified: false,
    twinOf: source === "twin" ? seed.id : null,
  });

  await db
    .delete(settings)
    .where(eq(settings.key, MODEL_QUARANTINE_MIGRATION_KEY))
    .run();
  const generated = await db
    .insert(questions)
    .values({ ...candidateValues("generated", "legacy generated"), verified: true })
    .returning()
    .get();
  const retiredTwin = await db
    .insert(questions)
    .values(candidateValues("twin", "retired twin"))
    .returning()
    .get();
  await db
    .insert(settings)
    .values({ key: "user_retired_qids", value: JSON.stringify([retiredTwin.id]) })
    .run();

  assert.equal(await applyModelQuarantineMigration(), 1);
  assert.equal(
    (
      await db
        .select({ verified: questions.verified })
        .from(questions)
        .where(eq(questions.id, generated.id))
        .get()
    )?.verified,
    false,
  );
  assert.equal(await applyModelQuarantineMigration(), 0);

  const queue = await quarantinedQuestionCandidates();
  assert.deepEqual(
    queue.map((question) => question.id),
    [generated.id],
  );

  const incomplete = await approveModelCheckedCandidate({
    questionId: generated.id,
    attestations: { ...COMPLETE_ATTESTATIONS, solvedIndependently: false },
  });
  assert.equal(incomplete.ok, false);

  const seedApproval = await approveModelCheckedCandidate({
    questionId: seed.id,
    attestations: COMPLETE_ATTESTATIONS,
  });
  assert.equal(seedApproval.ok, false);

  const retiredApproval = await approveModelCheckedCandidate({
    questionId: retiredTwin.id,
    attestations: COMPLETE_ATTESTATIONS,
  });
  assert.equal(retiredApproval.ok, false);

  const approved = await approveModelCheckedCandidate({
    questionId: generated.id,
    attestations: COMPLETE_ATTESTATIONS,
  });
  assert.deepEqual(approved, { ok: true, questionId: generated.id });
  assert.equal(
    (
      await db
        .select({ verified: questions.verified })
        .from(questions)
        .where(eq(questions.id, generated.id))
        .get()
    )?.verified,
    true,
  );
});
