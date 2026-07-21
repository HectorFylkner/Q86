import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import { count, eq } from "drizzle-orm";

test("legacy seed rows gain UIDs without changing numeric IDs or history", async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "q86-identity-test-"));
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

  const bank = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "scripts", "seed-bank.json"), "utf8"),
  ) as { questions: Array<Record<string, unknown>> };
  const legacyQuestion = bank.questions.find(
    (question) => question.content_version === 1,
  );
  assert.ok(legacyQuestion);

  // Recreate a db:push-era database: base schema, no migration ledger, and
  // one seed row already referenced by attempt history.
  const legacyClient = createClient({ url: `file:${databasePath}` });
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
      legacyQuestion.format as string,
      legacyQuestion.content_domain as string,
      legacyQuestion.context as string,
      legacyQuestion.fundamental_skill as string,
      legacyQuestion.subtopic as string,
      legacyQuestion.difficulty as number,
      legacyQuestion.stem_md as string,
      JSON.stringify(legacyQuestion.choices),
      legacyQuestion.correct_index as number,
      legacyQuestion.solution_md as string,
      legacyQuestion.fastest_path_md as string,
      JSON.stringify(legacyQuestion.trap_map),
      legacyQuestion.numeric_check as string | null,
      1,
    ],
  });
  await legacyClient.execute({
    sql: "insert into sessions (id, mode, config) values (?, ?, ?)",
    args: [7, "drill", "{}"],
  });
  await legacyClient.execute({
    sql: `insert into attempts (
      id, question_id, session_id, mode, focus, selected_index,
      correct, time_seconds, confidence
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [9, 86, 7, "drill", "focused", 0, 1, 91, "lock"],
  });
  legacyClient.close();

  const { ensureDbReady } = await import("../lib/db/bootstrap.ts");
  const { client, db } = await import("../lib/db/index.ts");
  closeAppClient = () => client.close();
  const { attempts, questionRevisions, questions } = await import(
    "../lib/db/schema.ts"
  );
  const { loadBank, seedBankNeedsSync } = await import(
    "../lib/db/seed-bank.ts"
  );

  await ensureDbReady();

  const migrated = await db
    .select()
    .from(questions)
    .where(eq(questions.id, 86))
    .get();
  assert.ok(migrated);
  assert.equal(migrated.uid, legacyQuestion.uid);
  assert.equal(migrated.contentVersion, 1);
  assert.equal(migrated.source, "seed");
  assert.equal(
    (
      await db
        .select({ questionId: attempts.questionId })
        .from(attempts)
        .where(eq(attempts.id, 9))
        .get()
    )?.questionId,
    86,
  );

  const seeds = await db
    .select({ id: questions.id, uid: questions.uid })
    .from(questions)
    .where(eq(questions.source, "seed"))
    .all();
  assert.equal(seeds.length, 603);
  assert.equal(new Set(seeds.map((question) => question.uid)).size, 603);
  assert.equal(
    (await db.select({ value: count() }).from(questionRevisions).get())?.value,
    603,
  );
  assert.equal(await seedBankNeedsSync(), false);

  const second = await loadBank();
  assert.deepEqual(second, {
    inserted: 0,
    updated: 603,
    backfilled: 0,
    retired: 0,
    revisions: 0,
  });
  assert.equal(await seedBankNeedsSync(), false);

  // An exact-stem model candidate is never selected by legacy backfill and
  // never overwritten by the seed synchronizer.
  const generated = await db
    .insert(questions)
    .values({
      source: "generated",
      format: migrated.format,
      contentDomain: migrated.contentDomain,
      context: migrated.context,
      fundamentalSkill: migrated.fundamentalSkill,
      subtopic: migrated.subtopic,
      difficulty: migrated.difficulty,
      stemMd: migrated.stemMd,
      choices: migrated.choices,
      correctIndex: migrated.correctIndex,
      solutionMd: "SENTINEL GENERATED CONTENT",
      fastestPathMd: migrated.fastestPathMd,
      trapMap: migrated.trapMap,
      numericCheck: migrated.numericCheck,
      verified: false,
    })
    .returning()
    .get();
  await loadBank();
  const untouched = await db
    .select()
    .from(questions)
    .where(eq(questions.id, generated.id))
    .get();
  assert.equal(untouched?.source, "generated");
  assert.equal(untouched?.uid, null);
  assert.equal(untouched?.solutionMd, "SENTINEL GENERATED CONTENT");

  // Content drift under an unchanged version is detected before any bank
  // overwrite; authors must bump the source-of-truth content_version.
  await db
    .update(questions)
    .set({ solutionMd: "TAMPERED SAME-VERSION CONTENT" })
    .where(eq(questions.id, migrated.id))
    .run();
  assert.equal(await seedBankNeedsSync(), true);
  await assert.rejects(
    loadBank(),
    /changed without incrementing content_version 1/,
  );
  assert.equal(
    (
      await db
        .select({ solutionMd: questions.solutionMd })
        .from(questions)
        .where(eq(questions.id, migrated.id))
        .get()
    )?.solutionMd,
    "TAMPERED SAME-VERSION CONTENT",
  );
});
