import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";

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
  const {
    attempts,
    conceptCertificationTransitions,
    conceptRemediations,
    questionConceptMappings,
    sessions,
  } = await import("../lib/db/schema.ts");
  const { loadBank } = await import("../lib/db/seed-bank.ts");
  const { syncCurriculumV3Mappings } = await import(
    "../lib/db/curriculum-mappings.ts"
  );
  const { buildQuestionMappings } = await import(
    "../curriculum/v3/coverage.ts"
  );
  const { buildCurriculumV3 } = await import("../curriculum/v3/graph.ts");
  const { PILOT_CONCEPT_IDS } = await import(
    "../curriculum/v3/pilot-concepts.ts"
  );
  const { countQuestions, selectQuestions } = await import(
    "../lib/engine.ts"
  );
  const { createQuestionSession } = await import(
    "../lib/question-session.ts"
  );
  const { recordQuestionAttempt, saveTimedQuestionSession } = await import(
    "../lib/question-attempts.ts"
  );
  const { finishQuestionSession } = await import(
    "../lib/question-session-completion.ts"
  );
  const {
    CONCEPT_REMEDIATION_CONFIG_KEY,
    exposedVariantFamilyIds,
  } = await import("../lib/concept-remediations.ts");
  const { currentQuestionDiagnosis } = await import(
    "../lib/db/curriculum-mappings.ts"
  );

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

  const conceptId = PILOT_CONCEPT_IDS.probability.atLeastOne;
  const allowedQuestionIds = new Set(
    stored
      .filter((row) => row.role === "primary" && row.conceptId === conceptId)
      .map((row) => row.questionId),
  );
  assert.ok(allowedQuestionIds.size > 0);
  assert.equal(
    await countQuestions({ conceptIds: [conceptId] }),
    allowedQuestionIds.size,
  );
  const selected = await selectQuestions({ conceptIds: [conceptId] }, 21);
  assert.equal(selected.length, allowedQuestionIds.size);
  assert.ok(selected.every((question) => allowedQuestionIds.has(question.id)));
  assert.equal(
    await countQuestions({ conceptIds: ["c.q86.quant.missing"] }),
    0,
  );

  const session = await createQuestionSession({
    mode: "drill",
    questions: [selected[0]],
    sessionSeed: "concept-remediation-fixture",
    blueprintSlots: [`concept.${conceptId}.practice.01`],
  });
  const displayed = session.questions[0];
  const wrongDisplayIndex = displayed.correctIndex === 0 ? 1 : 0;
  const recorded = await recordQuestionAttempt({
    sessionId: session.session.id,
    questionId: displayed.id,
    mode: "drill",
    selectedIndex: wrongDisplayIndex,
    timeSeconds: 75,
    confidence: "lock",
  });
  assert.equal(recorded.correct, false);
  assert.equal(recorded.conceptId, conceptId);
  assert.equal(recorded.remediationCreated, true);
  const storedAttempt = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, recorded.attemptId))
    .get();
  assert.equal(storedAttempt?.errorConceptId, conceptId);
  const action = await db
    .select()
    .from(conceptRemediations)
    .where(eq(conceptRemediations.sourceQuestionAttemptId, recorded.attemptId))
    .get();
  assert.equal(action?.trigger, "wrong");
  assert.equal(action?.conceptId, conceptId);
  assert.equal(action?.actionTargetId, conceptId);

  const replayed = await recordQuestionAttempt({
    sessionId: session.session.id,
    questionId: displayed.id,
    mode: "drill",
    selectedIndex: wrongDisplayIndex,
    timeSeconds: 75,
    confidence: "lock",
  });
  assert.equal(replayed.attemptId, recorded.attemptId);
  assert.equal(
    (
      await db
        .select()
        .from(attempts)
        .where(eq(attempts.sessionId, session.session.id))
        .all()
    ).length,
    1,
  );
  await assert.rejects(
    recordQuestionAttempt({
      sessionId: session.session.id,
      questionId: displayed.id,
      mode: "drill",
      selectedIndex: displayed.correctIndex,
      timeSeconds: 75,
      confidence: "lock",
    }),
    /already has a different submitted answer/,
  );

  const priorFamilies = await exposedVariantFamilyIds();
  const fresh = await selectQuestions(
    {
      conceptIds: [conceptId],
      excludeVariantFamilyIds: priorFamilies,
    },
    1,
  );
  assert.equal(fresh.length, 1);
  const remediationSession = await createQuestionSession({
    mode: "drill",
    questions: fresh,
    sessionSeed: "concept-remediation-resolution-fixture",
    config: {
      [CONCEPT_REMEDIATION_CONFIG_KEY]: {
        id: action!.id,
        remediationUid: action!.remediationUid,
        conceptId,
      },
    },
    blueprintSlots: [
      `remediation.${action!.id}.fresh-independent-check`,
    ],
  });
  const resolver = remediationSession.questions[0];
  const resolutionAttempt = await recordQuestionAttempt({
    sessionId: remediationSession.session.id,
    questionId: resolver.id,
    mode: "drill",
    selectedIndex: resolver.correctIndex,
    timeSeconds: 60,
    confidence: "lock",
  });
  assert.equal(resolutionAttempt.correct, true);
  assert.equal(resolutionAttempt.remediationResolved, true);
  const resolvedAction = await db
    .select()
    .from(conceptRemediations)
    .where(eq(conceptRemediations.id, action!.id))
    .get();
  assert.equal(resolvedAction?.status, "resolved");
  assert.equal(
    resolvedAction?.resolutionEvidence?.kind,
    "independent_fresh_roster_success",
  );
  assert.equal(
    resolvedAction?.resolutionEvidence?.questionAttemptId,
    resolutionAttempt.attemptId,
  );
  assert.equal(
    (await db.select().from(conceptCertificationTransitions).all()).length,
    0,
  );
  const replayedResolution = await recordQuestionAttempt({
    sessionId: remediationSession.session.id,
    questionId: resolver.id,
    mode: "drill",
    selectedIndex: resolver.correctIndex,
    timeSeconds: 60,
    confidence: "lock",
  });
  assert.equal(replayedResolution.attemptId, resolutionAttempt.attemptId);
  await finishQuestionSession(remediationSession.session.id);
  const closedSession = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, remediationSession.session.id))
    .get();
  assert.deepEqual(closedSession?.summary, {
    total: 1,
    correct: 1,
    avgTimeSeconds: 60,
    source: "server_attempt_roster_v1",
  });
  await finishQuestionSession(remediationSession.session.id);

  const guessAction = await db
    .insert(conceptRemediations)
    .values({
      remediationUid: "remediation.q86.guess-does-not-clear-fixture",
      conceptId,
      sourceQuestionAttemptId: recorded.attemptId,
      trigger: "low_confidence",
      actionType: "targeted_practice",
      actionTargetId: conceptId,
      priority: 3,
      rationaleMd:
        "Fixture action: a guessed correct answer must not clear this work.",
    })
    .returning()
    .get();
  const guessCandidates = await selectQuestions(
    {
      conceptIds: [conceptId],
      excludeVariantFamilyIds: await exposedVariantFamilyIds(),
    },
    1,
  );
  assert.equal(guessCandidates.length, 1);
  const guessSession = await createQuestionSession({
    mode: "drill",
    questions: guessCandidates,
    sessionSeed: "guess-does-not-resolve-fixture",
    config: {
      [CONCEPT_REMEDIATION_CONFIG_KEY]: {
        id: guessAction.id,
        remediationUid: guessAction.remediationUid,
        conceptId,
      },
    },
    blueprintSlots: [
      `remediation.${guessAction.id}.fresh-independent-check`,
    ],
  });
  const guessQuestion = guessSession.questions[0];
  const guessedCorrect = await recordQuestionAttempt({
    sessionId: guessSession.session.id,
    questionId: guessQuestion.id,
    mode: "drill",
    selectedIndex: guessQuestion.correctIndex,
    timeSeconds: 60,
    confidence: "guess",
  });
  assert.equal(guessedCorrect.correct, true);
  assert.equal(guessedCorrect.remediationResolved, false);
  assert.equal(
    (
      await db
        .select()
        .from(conceptRemediations)
        .where(eq(conceptRemediations.id, guessAction.id))
        .get()
    )?.status,
    "open",
  );
  assert.equal(
    (
      await selectQuestions(
        {
          conceptIds: [conceptId],
          excludeVariantFamilyIds: await exposedVariantFamilyIds(),
        },
        1,
      )
    ).length,
    0,
  );

  const incomplete = await createQuestionSession({
    mode: "drill",
    questions: [selected.at(-1)!],
    sessionSeed: "incomplete-session-fixture",
  });
  await assert.rejects(
    finishQuestionSession(incomplete.session.id),
    /exactly one persisted answer/,
  );

  const timed = await createQuestionSession({
    mode: "timed_set",
    questions: [selected[1] ?? selected[0]],
    sessionSeed: "concept-edit-remediation-fixture",
    blueprintSlots: [`concept.${conceptId}.timed-transfer.01`],
  });
  const timedQuestion = timed.questions[0];
  const editedWrongIndex = timedQuestion.correctIndex === 0 ? 1 : 0;
  const timedResult = await saveTimedQuestionSession({
    sessionId: timed.session.id,
    mode: "timed_set",
    results: [
      {
        questionId: timedQuestion.id,
        selectedIndex: editedWrongIndex,
        timeSeconds: 84,
        confidence: "lock",
        bookmarked: false,
        timeViolation: false,
      },
    ],
    edits: [
      {
        questionId: timedQuestion.id,
        fromIndex: timedQuestion.correctIndex,
        toIndex: editedWrongIndex,
        reason: "new_solution_path",
        justification:
          "I replaced the initially correct method after second-guessing it.",
      },
    ],
    durationSeconds: 84,
    notReachedCount: 0,
  });
  const editAction = await db
    .select()
    .from(conceptRemediations)
    .where(
      eq(
        conceptRemediations.sourceQuestionAttemptId,
        timedResult.attemptIdByQuestionId[timedQuestion.id],
      ),
    )
    .get();
  assert.equal(editAction?.trigger, "changed_from_correct");
  assert.equal(editAction?.conceptId, conceptId);
  assert.equal(editAction?.priority, 1);

  const currentPrimary = stored.find(
    (row) => row.role === "primary" && row.conceptId === conceptId,
  );
  assert.ok(currentPrimary);
  await db
    .insert(questionConceptMappings)
    .values({
      questionId: currentPrimary.questionId,
      questionUid: currentPrimary.questionUid,
      questionContentVersion: currentPrimary.questionContentVersion,
      conceptId: currentPrimary.conceptId,
      role: "primary",
      archetypeId: currentPrimary.archetypeId,
      surfaceFormId: currentPrimary.surfaceFormId,
      mappingVersion: currentPrimary.mappingVersion + 1,
      editorialState: "draft",
    })
    .run();
  assert.equal(
    await currentQuestionDiagnosis({
      questionId: currentPrimary.questionId,
      questionContentVersion: currentPrimary.questionContentVersion,
    }),
    null,
  );
  assert.equal(
    await countQuestions({ conceptIds: [conceptId] }),
    allowedQuestionIds.size - 1,
  );
});
