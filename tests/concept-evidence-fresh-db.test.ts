import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function rejectsSql(
  client: Client,
  sql: string,
  args: Array<string | number | null>,
  pattern: RegExp,
): Promise<void> {
  await assert.rejects(client.execute({ sql, args }), pattern);
}

test("fresh migration creates constrained, replayable concept evidence", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-concept-fresh-"));
  const databasePath = path.join(tempDir, "q86.db");
  const client = createClient({ url: `file:${databasePath}` });
  t.after(async () => {
    client.close();
    await rm(tempDir, { recursive: true, force: true });
  });

  await client.execute("pragma foreign_keys = on");
  await migrate(drizzle(client), {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  const migrationCount = await client.execute(
    "select count(*) as count from __drizzle_migrations",
  );
  assert.equal(migrationCount.rows[0].count, 7);

  await client.execute({
    sql: `insert into questions (
      id, uid, content_version, source, format, content_domain, context,
      fundamental_skill, subtopic, difficulty, stem_md, choices,
      correct_index, solution_md, fastest_path_md, trap_map, verified
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      86,
      "q86-fixture-probability-000000000086",
      1,
      "seed",
      "problem_solving",
      "arithmetic",
      "pure",
      "counting_sets_series_prob_stats",
      "probability",
      3,
      "Fresh fixture question",
      JSON.stringify(["1", "2", "3", "4", "5"]),
      2,
      "Fresh fixture solution",
      "Fresh fixture fastest path",
      JSON.stringify({ 0: "m0", 1: "m1", 3: "m3", 4: "m4" }),
      1,
    ],
  });
  await client.execute({
    sql: `insert into question_revisions (
      question_id, content_version, content_hash, snapshot
    ) values (?, ?, ?, ?)`,
    args: [86, 1, "fixture-hash-v1", JSON.stringify({ fixture: true })],
  });
  await client.execute({
    sql: "insert into sessions (id, mode, config) values (?, ?, ?)",
    args: [7, "drill", JSON.stringify({ blueprint: "pilot" })],
  });
  await client.execute({
    sql: `insert into attempts (
      id, question_id, session_id, mode, focus, selected_index, correct,
      time_seconds, confidence, error_type, error_subtag, error_concept_id,
      misconception_id
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      9,
      86,
      7,
      "drill",
      "focused",
      1,
      0,
      91,
      "lean",
      "content_gap",
      "probability",
      "quant.probability.complement.at-least-one",
      "misconception.probability.add-at-least-one",
    ],
  });

  const mappingSql = `insert into question_concept_mappings (
    question_id, question_uid, question_content_version, concept_id, role,
    archetype_id, surface_form_id, mapping_version, editorial_state
  ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const primaryMapping = [
    86,
    "q86-fixture-probability-000000000086",
    1,
    "quant.probability.complement.at-least-one",
    "primary",
    "at-least-one-without-replacement",
    "committee-selection",
    1,
    "approved",
  ];
  await client.execute({ sql: mappingSql, args: primaryMapping });
  await client.execute({
    sql: mappingSql,
    args: [
      86,
      "q86-fixture-probability-000000000086",
      1,
      "quant.combinatorics.combinations.unordered",
      "secondary",
      "at-least-one-without-replacement",
      "committee-selection",
      1,
      "approved",
    ],
  });

  await rejectsSql(
    client,
    mappingSql,
    [
      86,
      "q86-fixture-probability-000000000086",
      1,
      "quant.probability.complement.none",
      "primary",
      "at-least-one-without-replacement",
      "committee-selection",
      1,
      "approved",
    ],
    /UNIQUE constraint failed/i,
  );
  await rejectsSql(
    client,
    mappingSql,
    [
      86,
      "wrong-question-uid",
      1,
      "quant.probability.complement.none",
      "secondary",
      "at-least-one-without-replacement",
      "committee-selection",
      1,
      "approved",
    ],
    /identity\/version mismatch/i,
  );

  const distractorSql = `insert into distractor_misconception_mappings (
    question_id, question_uid, question_content_version,
    canonical_choice_index, concept_id, misconception_id, mapping_version,
    editorial_state
  ) values (?, ?, ?, ?, ?, ?, ?, ?)`;
  const distractorMapping = [
    86,
    "q86-fixture-probability-000000000086",
    1,
    1,
    "quant.probability.complement.at-least-one",
    "misconception.probability.add-at-least-one",
    1,
    "approved",
  ];
  await client.execute({ sql: distractorSql, args: distractorMapping });
  await rejectsSql(
    client,
    distractorSql,
    [
      86,
      "q86-fixture-probability-000000000086",
      1,
      2,
      "quant.probability.complement.at-least-one",
      "misconception.probability.correct-choice-is-not-a-distractor",
      1,
      "approved",
    ],
    /not a valid mapped-question distractor/i,
  );
  await rejectsSql(
    client,
    distractorSql,
    distractorMapping,
    /UNIQUE constraint failed/i,
  );

  const sessionItemSql = `insert into session_items (
    session_id, position, question_id, question_uid,
    question_content_version, blueprint_slot, choice_order_algorithm,
    display_to_canonical
  ) values (?, ?, ?, ?, ?, ?, ?, ?)`;
  await client.execute({
    sql: sessionItemSql,
    args: [
      7,
      0,
      86,
      "q86-fixture-probability-000000000086",
      1,
      "probability.easy.01",
      "q86-choice-order-v1",
      JSON.stringify([2, 0, 4, 1, 3]),
    ],
  });
  await rejectsSql(
    client,
    sessionItemSql,
    [
      7,
      0,
      86,
      "q86-fixture-probability-000000000086",
      1,
      "probability.easy.02",
      "q86-choice-order-v1",
      JSON.stringify([0, 1, 2, 3, 4]),
    ],
    /UNIQUE constraint failed/i,
  );
  await client.execute({
    sql: "insert into sessions (id, mode, config) values (?, ?, ?)",
    args: [8, "drill", "{}"],
  });
  await rejectsSql(
    client,
    sessionItemSql,
    [
      8,
      0,
      86,
      "q86-fixture-probability-000000000086",
      1,
      "probability.easy.01",
      "q86-choice-order-v1",
      JSON.stringify([0, 0, 1, 2, 3]),
    ],
    /CHECK constraint failed/i,
  );
  await rejectsSql(
    client,
    "update session_items set position = 1 where session_id = 7",
    [],
    /session items are immutable/i,
  );

  const learningAttemptSql = `insert into concept_learning_attempts (
    attempt_uid, session_id, concept_id, item_uid, item_content_version,
    item_kind, original_answer, original_method, declared_unknown,
    highest_hint_level, correction, final_answer, initial_correct,
    final_correct, time_seconds
  ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const learningAttempt = [
    "learning-attempt-0001",
    7,
    "quant.probability.complement.at-least-one",
    "check.probability.complement.0001",
    1,
    "check",
    "7/12",
    "direct addition",
    0,
    3,
    "Use 1 - P(none), not an overlapping sum.",
    "11/12",
    0,
    1,
    74.5,
  ];
  await client.execute({ sql: learningAttemptSql, args: learningAttempt });
  await rejectsSql(
    client,
    learningAttemptSql,
    learningAttempt,
    /UNIQUE constraint failed/i,
  );
  await rejectsSql(
    client,
    learningAttemptSql,
    [
      "learning-attempt-invalid-unknown",
      7,
      "quant.probability.complement.at-least-one",
      "check.probability.complement.0002",
      1,
      "check",
      null,
      null,
      1,
      0,
      null,
      null,
      1,
      0,
      12,
    ],
    /CHECK constraint failed/i,
  );
  const learningAttemptId = (
    await client.execute(
      "select id from concept_learning_attempts where attempt_uid = 'learning-attempt-0001'",
    )
  ).rows[0].id as number;
  await client.execute({
    sql: `insert into assistance_events (
      event_uid, concept_id, learning_attempt_id, kind, hint_level, details
    ) values (?, ?, ?, ?, ?, ?)`,
    args: [
      "assistance-event-0001",
      "quant.probability.complement.at-least-one",
      learningAttemptId,
      "hint_applied",
      3,
      JSON.stringify({ ladder: "setup" }),
    ],
  });
  await rejectsSql(
    client,
    `insert into assistance_events (
      event_uid, concept_id, kind, hint_level, details
    ) values (?, ?, ?, ?, ?)`,
    [
      "assistance-event-no-subject",
      "quant.probability.complement.at-least-one",
      "hint_opened",
      1,
      "{}",
    ],
    /CHECK constraint failed/i,
  );
  await rejectsSql(
    client,
    "update assistance_events set hint_level = 4 where event_uid = ?",
    ["assistance-event-0001"],
    /assistance events are immutable/i,
  );

  const certificationSql = `insert into concept_certification_transitions (
    transition_uid, concept_id, sequence, from_status, to_status, event_type,
    evidence_session_id, evidence
  ) values (?, ?, ?, ?, ?, ?, ?, ?)`;
  await client.execute({
    sql: certificationSql,
    args: [
      "certification-transition-0001",
      "quant.probability.complement.at-least-one",
      0,
      "unproven",
      "accuracy_proven",
      "accuracy_passed",
      7,
      JSON.stringify({ independentAccuracy: 0.9, sampleSize: 10 }),
    ],
  });
  await rejectsSql(
    client,
    certificationSql,
    [
      "certification-transition-gap",
      "quant.probability.complement.at-least-one",
      2,
      "accuracy_proven",
      "certified",
      "timed_transfer_passed",
      7,
      "{}",
    ],
    /not contiguous/i,
  );
  await client.execute({
    sql: certificationSql,
    args: [
      "certification-transition-0002",
      "quant.probability.complement.at-least-one",
      1,
      "accuracy_proven",
      "certified",
      "timed_transfer_passed",
      7,
      JSON.stringify({ timed: true }),
    ],
  });
  await rejectsSql(
    client,
    "delete from concept_certification_transitions where sequence = 1",
    [],
    /append-only/i,
  );

  await client.execute({
    sql: `insert into concept_remediations (
      remediation_uid, concept_id, misconception_id,
      source_question_attempt_id, trigger, action_type, action_target_id,
      rationale_md, due_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "remediation-0001",
      "quant.probability.complement.at-least-one",
      "misconception.probability.add-at-least-one",
      9,
      "wrong",
      "review_misconception",
      "misconception.probability.add-at-least-one",
      "Contrast overlapping addition with the complement method.",
      Date.now() + 86_400_000,
    ],
  });
  await rejectsSql(
    client,
    `insert into concept_remediations (
      remediation_uid, concept_id, trigger, action_type, action_target_id,
      status, rationale_md
    ) values (?, ?, ?, ?, ?, ?, ?)`,
    [
      "remediation-invalid-resolution",
      "quant.probability.complement.at-least-one",
      "manual",
      "review_concept",
      "quant.probability.complement.at-least-one",
      "resolved",
      "Missing resolution timestamp.",
    ],
    /CHECK constraint failed/i,
  );

  // The recorded session version remains replayable after the live question
  // advances; the exact order and broad+precise error tags are untouched.
  await client.execute(
    "update questions set content_version = 2 where id = 86",
  );
  const replay = await client.execute(
    `select si.question_id, si.question_uid, si.question_content_version,
      si.blueprint_slot, si.display_to_canonical, a.error_subtag,
      a.error_concept_id, a.misconception_id
      from session_items si join attempts a on a.session_id = si.session_id
      where si.session_id = 7`,
  );
  assert.deepEqual(replay.rows[0], {
    question_id: 86,
    question_uid: "q86-fixture-probability-000000000086",
    question_content_version: 1,
    blueprint_slot: "probability.easy.01",
    display_to_canonical: JSON.stringify([2, 0, 4, 1, 3]),
    error_subtag: "probability",
    error_concept_id: "quant.probability.complement.at-least-one",
    misconception_id: "misconception.probability.add-at-least-one",
  });
});
