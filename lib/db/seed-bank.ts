import fs from "node:fs";
import path from "node:path";
import { and, count, eq } from "drizzle-orm";
import { db } from "./index.ts";
import { questions, settings } from "./schema.ts";

/** Shape of one committed bank item (scripts/seed-bank.json). */
export type BankQuestion = {
  format: string;
  content_domain: string;
  context: string;
  fundamental_skill: string;
  subtopic: string;
  difficulty: number;
  stem_md: string;
  choices: string[];
  correct_index: number;
  solution_md: string;
  fastest_path_md: string;
  trap_map: Record<string, string>;
  numeric_check: string | null;
};

export const BANK_PATH = path.join(
  process.cwd(),
  "scripts",
  "seed-bank.json",
);

export function readBank(): { questions: BankQuestion[] } {
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

/** Questions the user retired via a content flag. The loader must never
 *  re-verify these, or a retirement would undo itself on the next boot. */
export const USER_RETIRED_KEY = "user_retired_qids";

export async function userRetiredIds(): Promise<Set<number>> {
  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, USER_RETIRED_KEY))
    .get();
  if (!row) return new Set();
  try {
    const ids = JSON.parse(row.value) as unknown;
    return new Set(Array.isArray(ids) ? ids.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

export async function verifiedSeedCount(): Promise<number> {
  const row = await db
    .select({ n: count() })
    .from(questions)
    .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
    .get();
  return row?.n ?? 0;
}

/**
 * Load the committed, already-verified bank into the database. Idempotent:
 * existing stems are refreshed in place, new ones inserted, and seed rows
 * whose stems left the bank are retired (verified=false — never deleted,
 * so attempt history survives).
 */
export async function loadBank(): Promise<{
  inserted: number;
  updated: number;
  retired: number;
}> {
  const bank = readBank();
  const userRetired = await userRetiredIds();
  const existing = new Map(
    (
      await db
        .select({ id: questions.id, stem: questions.stemMd })
        .from(questions)
        .all()
    ).map((r) => [r.stem, r.id]),
  );
  let inserted = 0;
  let updated = 0;
  let retired = 0;
  await db.transaction(async (tx) => {
    for (const q of bank.questions) {
      const existingId = existing.get(q.stem_md);
      if (existingId != null) {
        // Upsert: editorial fixes in the bank propagate to installed rows.
        await tx
          .update(questions)
          .set({
            choices: q.choices,
            correctIndex: q.correct_index,
            solutionMd: q.solution_md,
            fastestPathMd: q.fastest_path_md,
            trapMap: q.trap_map,
            numericCheck: q.numeric_check,
            verified: !userRetired.has(existingId),
          })
          .where(eq(questions.id, existingId))
          .run();
        updated++;
        continue;
      }
      await tx
        .insert(questions)
        .values({
          source: "seed",
          format: q.format as (typeof questions.$inferInsert)["format"],
          contentDomain:
            q.content_domain as (typeof questions.$inferInsert)["contentDomain"],
          context: q.context as (typeof questions.$inferInsert)["context"],
          fundamentalSkill:
            q.fundamental_skill as (typeof questions.$inferInsert)["fundamentalSkill"],
          subtopic: q.subtopic as (typeof questions.$inferInsert)["subtopic"],
          difficulty: q.difficulty,
          stemMd: q.stem_md,
          choices: q.choices,
          correctIndex: q.correct_index,
          solutionMd: q.solution_md,
          fastestPathMd: q.fastest_path_md,
          trapMap: q.trap_map,
          numericCheck: q.numeric_check,
          verified: true,
        })
        .run();
      inserted++;
    }
    // Retire seed rows whose stems left the bank (e.g. questions replaced
    // after failing a deeper audit).
    const bankStems = new Set(bank.questions.map((q) => q.stem_md));
    const seedRows = await tx
      .select({ id: questions.id, stem: questions.stemMd })
      .from(questions)
      .where(and(eq(questions.source, "seed"), eq(questions.verified, true)))
      .all();
    for (const row of seedRows) {
      if (bankStems.has(row.stem)) continue;
      await tx
        .update(questions)
        .set({ verified: false })
        .where(eq(questions.id, row.id))
        .run();
      retired++;
    }
  });
  return { inserted, updated, retired };
}
