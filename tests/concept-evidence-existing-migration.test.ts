import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";

test("bootstrap evolution preserves a pre-migration fixture and is idempotent", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-concept-existing-"));
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

  // A db:push-era fixture: numeric identities and attempt history exist, but
  // neither the migration ledger nor any concept-evidence columns/tables do.
  const legacyClient = createClient({ url: `file:${databasePath}` });
  await legacyClient.execute("pragma foreign_keys = on");
  const baseMigration = fs.readFileSync(
    path.join(process.cwd(), "drizzle", "0000_sleepy_kree.sql"),
    "utf8",
  );
  for (const statement of baseMigration.split("--> statement-breakpoint")) {
    if (statement.trim()) await legacyClient.execute(statement);
  }
  await legacyClient.execute({
    sql: `insert into questions (
      id, source, format, content_domain, context, fundamental_skill,
      subtopic, difficulty, stem_md, choices, correct_index, solution_md,
      fastest_path_md, trap_map, numeric_check, verified
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      86,
      "seed",
      "problem_solving",
      "arithmetic",
      "pure",
      "counting_sets_series_prob_stats",
      "probability",
      3,
      "Legacy fixture question",
      JSON.stringify(["1", "2", "3", "4", "5"]),
      2,
      "Legacy solution",
      "Legacy fastest path",
      JSON.stringify({ 0: "m0", 1: "m1", 3: "m3", 4: "m4" }),
      null,
      1,
    ],
  });
  await legacyClient.execute({
    sql: "insert into sessions (id, mode, config) values (?, ?, ?)",
    args: [7, "drill", JSON.stringify({ legacy: true })],
  });
  await legacyClient.execute({
    sql: `insert into attempts (
      id, question_id, session_id, mode, focus, selected_index, correct,
      time_seconds, confidence, error_type, error_subtag, user_notes
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      "preserve me",
    ],
  });
  legacyClient.close();

  const { client } = await import("../lib/db/index.ts");
  const { evolveSchema } = await import("../lib/db/bootstrap.ts");
  closeAppClient = () => client.close();

  await evolveSchema();
  await evolveSchema();

  const question = await client.execute({
    sql: "select id, uid, content_version from questions where id = ?",
    args: [86],
  });
  assert.deepEqual(question.rows[0], {
    id: 86,
    uid: null,
    content_version: 1,
  });

  const attempt = await client.execute({
    sql: `select id, question_id, session_id, error_subtag,
      error_concept_id, misconception_id, user_notes
      from attempts where id = ?`,
    args: [9],
  });
  assert.deepEqual(attempt.rows[0], {
    id: 9,
    question_id: 86,
    session_id: 7,
    error_subtag: "probability",
    error_concept_id: null,
    misconception_id: null,
    user_notes: "preserve me",
  });

  const tables = await client.execute(
    `select name from sqlite_master
      where type = 'table' and name in (
        'question_concept_mappings',
        'distractor_misconception_mappings',
        'session_items',
        'concept_learning_attempts',
        'assistance_events',
        'concept_certification_transitions',
        'concept_remediations'
      ) order by name`,
  );
  assert.deepEqual(
    tables.rows.map((row) => row.name),
    [
      "assistance_events",
      "concept_certification_transitions",
      "concept_learning_attempts",
      "concept_remediations",
      "distractor_misconception_mappings",
      "question_concept_mappings",
      "session_items",
    ],
  );

  const triggers = await client.execute(
    "select name from sqlite_master where type = 'trigger'",
  );
  const triggerNames = new Set(triggers.rows.map((row) => String(row.name)));
  for (const expected of [
    "question_concept_identity_insert",
    "question_concept_identity_update",
    "distractor_misconception_integrity_insert",
    "distractor_misconception_integrity_update",
    "session_item_identity_insert",
    "session_item_immutable_update",
    "session_item_immutable_delete",
    "concept_learning_attempt_immutable_update",
    "concept_learning_attempt_immutable_delete",
    "assistance_event_immutable_update",
    "assistance_event_immutable_delete",
    "concept_certification_chain_insert",
    "concept_certification_immutable_update",
    "concept_certification_immutable_delete",
  ]) {
    assert.equal(triggerNames.has(expected), true, `missing trigger ${expected}`);
  }

  // The evolved tables are usable after assigning the legacy row its stable
  // UID; the numeric question/session/attempt IDs remain untouched.
  await client.execute({
    sql: "update questions set uid = ? where id = ?",
    args: ["q86-fixture-probability-000000000086", 86],
  });
  await client.execute({
    sql: `insert into question_concept_mappings (
      question_id, question_uid, question_content_version, concept_id, role,
      archetype_id, surface_form_id, mapping_version, editorial_state
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      86,
      "q86-fixture-probability-000000000086",
      1,
      "quant.probability.complement.at-least-one",
      "primary",
      "at-least-one-without-replacement",
      "committee-selection",
      1,
      "draft",
    ],
  });
  const mapping = await client.execute(
    "select id, question_id from question_concept_mappings",
  );
  assert.deepEqual(mapping.rows[0], { id: 1, question_id: 86 });
});
