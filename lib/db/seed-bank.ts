import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { and, count, eq, isNotNull } from "drizzle-orm";
import type {
  ContentDomain,
  Context,
  FundamentalSkill,
  QuestionFormat,
  Subtopic,
} from "../taxonomy.ts";
import { db } from "./index.ts";
import {
  questionRevisions,
  questions,
  settings,
  type Question,
  type QuestionContentSnapshot,
} from "./schema.ts";

/** Shape of one committed source-of-truth bank item. */
export type BankQuestion = {
  uid: string;
  content_version: number;
  format: QuestionFormat;
  content_domain: ContentDomain;
  context: Context;
  fundamental_skill: FundamentalSkill;
  subtopic: Subtopic;
  difficulty: number;
  stem_md: string;
  choices: string[];
  correct_index: number;
  solution_md: string;
  fastest_path_md: string;
  trap_map: Record<string, string>;
  numeric_check: string | null;
  provenance?: string;
};

export const BANK_PATH = path.join(process.cwd(), "scripts", "seed-bank.json");

export function readBank(): { questions: BankQuestion[] } {
  return JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
}

/** Stable source revision used by bootstrap to avoid re-reading and
 * re-validating the full remote bank on every serverless cold start. */
export function seedBankFingerprint(): string {
  return createHash("sha256").update(fs.readFileSync(BANK_PATH)).digest("hex");
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

/** A count-only bootstrap check misses content-version changes. */
export async function seedBankNeedsSync(): Promise<boolean> {
  const bank = readBank();
  const retired = await userRetiredIds();
  const rows = await db
    .select()
    .from(questions)
    .where(eq(questions.source, "seed"))
    .all();
  const byUid = new Map(
    rows.filter((row) => row.uid != null).map((row) => [row.uid!, row]),
  );
  const bankUids = new Set(bank.questions.map((question) => question.uid));

  for (const question of bank.questions) {
    const installed = byUid.get(question.uid);
    if (!installed) return true;
    if (installed.contentVersion !== question.content_version) return true;
    if (installed.verified !== !retired.has(installed.id)) return true;
    if (
      snapshotHash(snapshotFromInstalled(installed, installed.uid!)) !==
      snapshotHash(snapshotFromBank(question))
    )
      return true;
  }
  return rows.some(
    (row) => row.verified && (row.uid == null || !bankUids.has(row.uid)),
  );
}

function snapshotFromBank(question: BankQuestion): QuestionContentSnapshot {
  return {
    uid: question.uid,
    contentVersion: question.content_version,
    format: question.format,
    contentDomain: question.content_domain,
    context: question.context,
    fundamentalSkill: question.fundamental_skill,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    stemMd: question.stem_md,
    choices: question.choices,
    correctIndex: question.correct_index,
    solutionMd: question.solution_md,
    fastestPathMd: question.fastest_path_md,
    trapMap: question.trap_map,
    numericCheck: question.numeric_check,
  };
}

function snapshotFromInstalled(
  question: Question,
  uid: string,
): QuestionContentSnapshot {
  return {
    uid,
    contentVersion: question.contentVersion,
    format: question.format,
    contentDomain: question.contentDomain,
    context: question.context,
    fundamentalSkill: question.fundamentalSkill,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    stemMd: question.stemMd,
    choices: question.choices,
    correctIndex: question.correctIndex,
    solutionMd: question.solutionMd,
    fastestPathMd: question.fastestPathMd,
    trapMap: question.trapMap,
    numericCheck: question.numericCheck,
  };
}

function snapshotHash(snapshot: QuestionContentSnapshot): string {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

/**
 * Load the committed, already-reviewed bank into the database.
 *
 * Identity is UID-first. An exact stem match is permitted only once to
 * backfill a legacy source=seed row whose UID is null; generated/twin rows
 * are never candidates. Numeric IDs are preserved, so attempts, flags, and
 * redo history remain attached. Removed seed UIDs are quarantined by setting
 * verified=false, never deleted.
 */
export async function loadBank(): Promise<{
  inserted: number;
  updated: number;
  backfilled: number;
  retired: number;
  revisions: number;
}> {
  const bank = readBank();
  const bankUids = new Set<string>();
  for (const question of bank.questions) {
    if (bankUids.has(question.uid)) {
      throw new Error(`Duplicate UID in seed bank: ${question.uid}`);
    }
    if (!Number.isInteger(question.content_version) || question.content_version < 1) {
      throw new Error(`Invalid content version for ${question.uid}`);
    }
    bankUids.add(question.uid);
  }

  const userRetired = await userRetiredIds();
  const allUidRows = await db
    .select({ id: questions.id, uid: questions.uid, source: questions.source })
    .from(questions)
    .where(isNotNull(questions.uid))
    .all();
  for (const row of allUidRows) {
    if (row.uid && bankUids.has(row.uid) && row.source !== "seed") {
      throw new Error(
        `Refusing seed UID ${row.uid}: it belongs to ${row.source} question ${row.id}.`,
      );
    }
  }

  const seedRows = await db
    .select()
    .from(questions)
    .where(eq(questions.source, "seed"))
    .all();
  const byUid = new Map(
    seedRows.filter((row) => row.uid != null).map((row) => [row.uid!, row]),
  );
  const legacyByStem = new Map<string, typeof seedRows>();
  for (const row of seedRows) {
    if (row.uid != null) continue;
    const matches = legacyByStem.get(row.stemMd) ?? [];
    matches.push(row);
    legacyByStem.set(row.stemMd, matches);
  }
  for (const question of bank.questions) {
    if (byUid.has(question.uid)) continue;
    const legacy = legacyByStem.get(question.stem_md) ?? [];
    if (legacy.length > 1) {
      throw new Error(
        `Ambiguous legacy backfill for ${question.uid}: ${legacy.length} seed rows share its stem.`,
      );
    }
  }

  const existingRevisionRows = await db
    .select({
      questionId: questionRevisions.questionId,
      contentVersion: questionRevisions.contentVersion,
      contentHash: questionRevisions.contentHash,
    })
    .from(questionRevisions)
    .all();
  const revisionHashes = new Map(
    existingRevisionRows.map((revision) => [
      `${revision.questionId}:${revision.contentVersion}`,
      revision.contentHash,
    ]),
  );

  let inserted = 0;
  let updated = 0;
  let backfilled = 0;
  let retired = 0;
  let revisions = 0;
  const activeIds = new Set<number>();

  await db.transaction(async (tx) => {
    const recordRevision = async (
      questionId: number,
      snapshot: QuestionContentSnapshot,
    ) => {
      const hash = snapshotHash(snapshot);
      const key = `${questionId}:${snapshot.contentVersion}`;
      const priorHash = revisionHashes.get(key);
      if (priorHash != null) {
        if (priorHash !== hash) {
          throw new Error(
            `Question ${snapshot.uid} changed without incrementing content_version ${snapshot.contentVersion}.`,
          );
        }
        return;
      }
      await tx
        .insert(questionRevisions)
        .values({
          questionId,
          contentVersion: snapshot.contentVersion,
          contentHash: hash,
          snapshot,
        })
        .run();
      revisionHashes.set(key, hash);
      revisions++;
    };

    for (const question of bank.questions) {
      let installed = byUid.get(question.uid);
      if (!installed) {
        const legacy = legacyByStem.get(question.stem_md) ?? [];
        installed = legacy[0];
        if (installed) backfilled++;
      }

      const currentSnapshot = snapshotFromBank(question);
      if (installed) {
        if (installed.contentVersion > question.content_version) {
          throw new Error(
            `Refusing to downgrade ${question.uid} from version ${installed.contentVersion} to ${question.content_version}.`,
          );
        }
        const installedSnapshot = snapshotFromInstalled(
          installed,
          installed.uid ?? question.uid,
        );
        if (installed.uid != null) {
          const installedHash = snapshotHash(installedSnapshot);
          const bankHash = snapshotHash(currentSnapshot);
          if (
            installed.contentVersion === question.content_version &&
            installedHash !== bankHash
          ) {
            throw new Error(
              `Question ${question.uid} changed without incrementing content_version ${question.content_version}.`,
            );
          }
        }
        if (installed.contentVersion < question.content_version) {
          await recordRevision(installed.id, installedSnapshot);
        }

        await tx
          .update(questions)
          .set({
            uid: question.uid,
            contentVersion: question.content_version,
            format: question.format,
            contentDomain: question.content_domain,
            context: question.context,
            fundamentalSkill: question.fundamental_skill,
            subtopic: question.subtopic,
            difficulty: question.difficulty,
            stemMd: question.stem_md,
            choices: question.choices,
            correctIndex: question.correct_index,
            solutionMd: question.solution_md,
            fastestPathMd: question.fastest_path_md,
            trapMap: question.trap_map,
            numericCheck: question.numeric_check,
            verified: !userRetired.has(installed.id),
          })
          .where(and(eq(questions.id, installed.id), eq(questions.source, "seed")))
          .run();
        activeIds.add(installed.id);
        await recordRevision(installed.id, currentSnapshot);
        updated++;
        continue;
      }

      const created = await tx
        .insert(questions)
        .values({
          uid: question.uid,
          contentVersion: question.content_version,
          source: "seed",
          format: question.format,
          contentDomain: question.content_domain,
          context: question.context,
          fundamentalSkill: question.fundamental_skill,
          subtopic: question.subtopic,
          difficulty: question.difficulty,
          stemMd: question.stem_md,
          choices: question.choices,
          correctIndex: question.correct_index,
          solutionMd: question.solution_md,
          fastestPathMd: question.fastest_path_md,
          trapMap: question.trap_map,
          numericCheck: question.numeric_check,
          verified: true,
        })
        .returning({ id: questions.id })
        .get();
      activeIds.add(created.id);
      await recordRevision(created.id, currentSnapshot);
      inserted++;
    }

    for (const row of seedRows) {
      if (activeIds.has(row.id) || !row.verified) continue;
      await tx
        .update(questions)
        .set({ verified: false })
        .where(and(eq(questions.id, row.id), eq(questions.source, "seed")))
        .run();
      retired++;
    }
  });

  return { inserted, updated, backfilled, retired, revisions };
}
