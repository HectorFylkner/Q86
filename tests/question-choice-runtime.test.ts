import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";

test("question sessions persist display order while attempt and edit history stay canonical", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-choice-runtime-"));
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
  const migrations = fs
    .readdirSync(path.join(process.cwd(), "drizzle"))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const migration of migrations) {
    const sql = fs.readFileSync(
      path.join(process.cwd(), "drizzle", migration),
      "utf8",
    );
    for (const statement of sql.split("--> statement-breakpoint")) {
      if (statement.trim()) await migrationClient.execute(statement);
    }
  }
  migrationClient.close();

  const { db, client } = await import("../lib/db/index.ts");
  closeAppClient = () => client.close();
  const { attempts, edits, questions, sessionItems, sessions } = await import(
    "../lib/db/schema.ts"
  );
  const {
    canonicalIndexForQuestion,
    displayIndexForQuestion,
    parsePersistedQuestionChoiceRoster,
    questionInDisplayOrder,
  } = await import("../lib/question-choice-order.ts");
  const {
    createQuestionSession,
    loadQuestionSession,
    SESSION_CHOICE_ROSTER_KEY,
  } = await import("../lib/question-session.ts");
  const { recordQuestionAttempt, saveTimedQuestionSession } = await import(
    "../lib/question-attempts.ts"
  );

  const problemSolving = await db
    .insert(questions)
    .values({
      uid: null,
      contentVersion: 1,
      source: "generated",
      format: "problem_solving",
      contentDomain: "algebra",
      context: "pure",
      fundamentalSkill: "equal_unequal_alg",
      subtopic: "linear_systems",
      difficulty: 3,
      stemMd: "Which value is the answer?",
      choices: ["$10$", "$20$", "$30$", "$40$", "$50$"],
      correctIndex: 3,
      solutionMd: "The answer is $40$.",
      fastestPathMd: "Solve directly.",
      trapMap: {
        0: "Stopped too soon.",
        1: "Dropped a factor.",
        2: "Made an arithmetic slip.",
        4: "Added an extra factor.",
      },
      numericCheck: null,
      verified: true,
    })
    .returning()
    .get();
  const dataSufficiencyChoices = [
    "Statement (1) alone is sufficient, but statement (2) alone is not sufficient.",
    "Statement (2) alone is sufficient, but statement (1) alone is not sufficient.",
    "Both statements together are sufficient, but neither statement alone is sufficient.",
    "Each statement alone is sufficient.",
    "Statements (1) and (2) together are not sufficient.",
  ];
  const dataSufficiency = await db
    .insert(questions)
    .values({
      uid: "q86-test-choice-runtime-ds0001",
      contentVersion: 1,
      source: "seed",
      format: "data_sufficiency",
      contentDomain: "algebra",
      context: "pure",
      fundamentalSkill: "equal_unequal_alg",
      subtopic: "linear_systems",
      difficulty: 3,
      stemMd: "What is $x$? (1) $x=2$. (2) $x^2=4$.",
      choices: dataSufficiencyChoices,
      correctIndex: 0,
      solutionMd: "Statement (1) fixes $x$.",
      fastestPathMd: "Test each statement independently.",
      trapMap: {
        1: "Ignored statement (1).",
        2: "Combined unnecessarily.",
        3: "Missed the sign ambiguity in (2).",
        4: "Missed that statement (1) is sufficient.",
      },
      numericCheck: null,
      verified: true,
    })
    .returning()
    .get();

  const drill = await createQuestionSession({
    mode: "drill",
    questions: [problemSolving, dataSufficiency],
    sessionSeed: "drill-runtime-fixture",
  });
  assert.equal(drill.questions.length, 2);

  const storedDrillSession = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, drill.session.id))
    .get();
  assert.ok(storedDrillSession);
  assert.deepEqual(storedDrillSession.config.questionIds, [
    problemSolving.id,
    dataSufficiency.id,
  ]);
  const drillRoster = parsePersistedQuestionChoiceRoster(
    storedDrillSession.config[SESSION_CHOICE_ROSTER_KEY],
  );
  assert.ok(drillRoster);
  assert.equal(
    drillRoster.byQuestionId[String(problemSolving.id)].questionKey,
    `db:${problemSolving.id}:v1:fproblem_solving`,
  );
  const storedDrillItems = await db
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, drill.session.id))
    .orderBy(sessionItems.position)
    .all();
  assert.equal(storedDrillItems.length, 2);
  assert.deepEqual(
    storedDrillItems.map((item) => item.questionId),
    [problemSolving.id, dataSufficiency.id],
  );
  assert.equal(
    storedDrillItems[0].questionUid,
    `db:${problemSolving.id}:v1:fproblem_solving`,
  );
  assert.equal(storedDrillItems[1].questionUid, dataSufficiency.uid);
  assert.deepEqual(
    storedDrillItems[0].displayToCanonical,
    drillRoster.byQuestionId[String(problemSolving.id)].order
      .displayToCanonical,
  );

  const displayedPs = drill.questions[0];
  assert.equal(
    canonicalIndexForQuestion(
      displayedPs.correctIndex,
      problemSolving,
      drillRoster,
    ),
    problemSolving.correctIndex,
  );
  for (let displayIndex = 0; displayIndex < 5; displayIndex++) {
    const canonicalIndex = canonicalIndexForQuestion(
      displayIndex,
      problemSolving,
      drillRoster,
    );
    assert.equal(
      displayedPs.choices[displayIndex],
      problemSolving.choices[canonicalIndex],
    );
    assert.equal(
      displayedPs.trapMap[String(displayIndex)],
      problemSolving.trapMap[String(canonicalIndex)],
    );
  }
  assert.deepEqual(drill.questions[1].choices, dataSufficiencyChoices);
  assert.equal(drill.questions[1].correctIndex, dataSufficiency.correctIndex);

  const drillAttemptResult = await recordQuestionAttempt({
    sessionId: drill.session.id,
    questionId: problemSolving.id,
    mode: "drill",
    selectedIndex: displayedPs.correctIndex,
    timeSeconds: 72,
    confidence: "lock",
  });
  assert.equal(drillAttemptResult.correct, true);
  const storedDrillAttempt = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, drillAttemptResult.attemptId))
    .get();
  assert.ok(storedDrillAttempt);
  assert.equal(storedDrillAttempt.selectedIndex, problemSolving.correctIndex);
  assert.equal(storedDrillAttempt.correct, true);

  const loadedDrill = await loadQuestionSession(drill.session.id, "drill");
  assert.equal(loadedDrill.sessionItems.length, 2);
  assert.deepEqual(
    questionInDisplayOrder(problemSolving, loadedDrill.choiceOrderRoster),
    displayedPs,
  );

  // Pick a deterministic seed whose correct answer visibly moves so the edit
  // assertions cannot accidentally pass through an identity permutation.
  let timedSeed = "";
  for (let candidate = 0; candidate < 1_000; candidate++) {
    const seed = `timed-edit-${candidate}`;
    const candidateSession = await createQuestionSession({
      mode: "timed_set",
      questions: [problemSolving],
      sessionSeed: seed,
    });
    const candidateQuestion = candidateSession.questions[0];
    if (candidateQuestion.correctIndex !== problemSolving.correctIndex) {
      timedSeed = seed;
      // Keep this first non-identity session as the integration fixture.
      const timedSession = candidateSession;
      const timedQuestion = candidateQuestion;
      const wrongDisplayIndex = timedQuestion.correctIndex === 0 ? 1 : 0;
      const timedRoster = (
        await loadQuestionSession(timedSession.session.id, "timed_set")
      ).choiceOrderRoster;
      const canonicalWrongIndex = canonicalIndexForQuestion(
        wrongDisplayIndex,
        problemSolving,
        timedRoster,
      );

      const saved = await saveTimedQuestionSession({
        sessionId: timedSession.session.id,
        mode: "timed_set",
        results: [
          {
            questionId: problemSolving.id,
            selectedIndex: timedQuestion.correctIndex,
            timeSeconds: 104,
            confidence: "lean",
            bookmarked: true,
            timeViolation: false,
          },
        ],
        edits: [
          {
            questionId: problemSolving.id,
            fromIndex: wrongDisplayIndex,
            toIndex: timedQuestion.correctIndex,
            reason: "found_calc_error",
            justification: "I found the dropped factor in line two.",
          },
        ],
        durationSeconds: 104,
        notReachedCount: 0,
      });
      assert.equal(saved.correctByQuestionId[problemSolving.id], true);
      assert.equal(saved.sessionEditNet, 1);

      const storedTimedAttempt = await db
        .select()
        .from(attempts)
        .where(eq(attempts.sessionId, timedSession.session.id))
        .get();
      assert.ok(storedTimedAttempt);
      assert.equal(storedTimedAttempt.selectedIndex, problemSolving.correctIndex);
      assert.equal(storedTimedAttempt.correct, true);
      const storedTimedEdit = await db
        .select()
        .from(edits)
        .where(eq(edits.sessionId, timedSession.session.id))
        .get();
      assert.ok(storedTimedEdit);
      assert.equal(storedTimedEdit.fromIndex, canonicalWrongIndex);
      assert.equal(storedTimedEdit.toIndex, problemSolving.correctIndex);
      assert.equal(storedTimedEdit.fromCorrect, false);
      assert.equal(storedTimedEdit.toCorrect, true);

      const reloadedTimed = await loadQuestionSession(
        timedSession.session.id,
        "timed_set",
      );
      assert.deepEqual(
        questionInDisplayOrder(problemSolving, reloadedTimed.choiceOrderRoster),
        timedQuestion,
      );
      assert.equal(
        displayIndexForQuestion(
          storedTimedAttempt.selectedIndex,
          problemSolving,
          reloadedTimed.choiceOrderRoster,
        ),
        timedQuestion.correctIndex,
      );
      await assert.rejects(
        saveTimedQuestionSession({
          sessionId: timedSession.session.id,
          mode: "timed_set",
          results: [],
          edits: [],
          durationSeconds: 104,
          notReachedCount: 1,
        }),
        /already been submitted/,
      );
      break;
    }
  }
  assert.notEqual(timedSeed, "", "expected a non-identity deterministic seed");
});
