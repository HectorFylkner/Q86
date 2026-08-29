import { and, asc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { questions } from "./db/schema.ts";
import {
  FUNDAMENTAL_SKILLS,
  SKILL_BY_SUBTOPIC,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * The free diagnostic: twelve questions, three per fundamental skill,
 * answered without an account.
 *
 * It reads the shared bank through the raw handle because the bank is
 * global and un-owned (ADR 0001) and the caller has no account yet. It
 * writes nothing at all: an anonymous visitor leaves no row behind, which
 * is both the privacy answer and the reason no cookie is needed to take
 * it. The result lives in the page's own state until they choose to make
 * an account.
 *
 * Correct answers never leave the server. `publicQuestions()` strips them,
 * and `scoreDiagnostic()` re-reads them from the bank when the answers
 * come back — so the endpoint cannot be used to dump the bank's key.
 */

export const PER_SKILL = 3;
export const DIAGNOSTIC_LENGTH = FUNDAMENTAL_SKILLS.length * PER_SKILL;

/** The band the exam actually reports for the Quant section. */
export const BAND_FLOOR = 60;
export const BAND_CEILING = 90;
/** Half-width of the reported interval. Twelve questions cannot do better. */
export const BAND_MARGIN = 3;

export type PublicQuestion = {
  id: number;
  format: "problem_solving" | "data_sufficiency";
  fundamentalSkill: FundamentalSkill;
  subtopic: Subtopic;
  difficulty: number;
  stemMd: string;
  choices: string[];
};

type BankRow = PublicQuestion & { correctIndex: number };

/**
 * Three questions per skill, spread over difficulty and chosen by a stable
 * rule rather than at random: two visitors comparing notes should see the
 * same diagnostic, and a stable set is one the page can cache.
 */
async function bankSet(): Promise<BankRow[]> {
  const chosen: BankRow[] = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    const rows = await db
      .select({
        id: questions.id,
        format: questions.format,
        fundamentalSkill: questions.fundamentalSkill,
        subtopic: questions.subtopic,
        difficulty: questions.difficulty,
        stemMd: questions.stemMd,
        choices: questions.choices,
        correctIndex: questions.correctIndex,
      })
      .from(questions)
      .where(
        and(eq(questions.verified, true), eq(questions.fundamentalSkill, skill)),
      )
      .orderBy(asc(questions.difficulty), asc(questions.id));
    if (rows.length === 0) continue;

    // An easy, a mid and a hard one, by position rather than by a
    // difficulty literal, so a bank with an unusual spread still yields
    // three questions that climb.
    const at = [0, Math.floor(rows.length / 2), rows.length - 1];
    const seen = new Set<number>();
    for (const index of at) {
      let i = index;
      while (i < rows.length && seen.has(rows[i].id)) i++;
      const row = rows[i];
      if (!row) continue;
      seen.add(row.id);
      chosen.push(row as BankRow);
    }
  }
  return chosen;
}

/** The set as the browser may see it: no correct index, no solution. */
export async function diagnosticQuestions(): Promise<PublicQuestion[]> {
  const rows = await bankSet();
  return rows.map(({ correctIndex: _correctIndex, ...rest }) => rest);
}

export type SkillResult = {
  skill: FundamentalSkill;
  correct: number;
  total: number;
};

export type DiagnosticResult = {
  correct: number;
  total: number;
  /** Inclusive estimate of the Quant section score, e.g. 74–80. */
  bandLow: number;
  bandHigh: number;
  perSkill: SkillResult[];
  /** Lowest-scoring skill; ties break toward the earlier one in the
   *  taxonomy, so the answer is deterministic. */
  weakestSkill: FundamentalSkill;
  /** The subtopic inside that skill where an answer was actually missed;
   *  null when nothing in the weakest skill was missed. */
  weakestSubtopic: Subtopic | null;
};

/**
 * Difficulty-weighted accuracy mapped onto the reported band.
 *
 * Deliberately blunt: a harder question is worth its difficulty, the map
 * onto 60–90 is linear, and the result is reported as an interval rather
 * than a point. Twelve questions do not support anything finer, and
 * claiming they do would be the kind of unsubstantiated precision
 * marknadsföringslagen exists to stop.
 */
export async function scoreDiagnostic(
  answers: Array<number | null>,
): Promise<DiagnosticResult> {
  const rows = await bankSet();
  if (rows.length === 0) throw new Error("scoreDiagnostic: the bank is empty.");

  let weight = 0;
  let earned = 0;
  let correct = 0;
  const perSkill = new Map<FundamentalSkill, SkillResult>(
    FUNDAMENTAL_SKILLS.map((skill) => [skill, { skill, correct: 0, total: 0 }]),
  );
  const missedBySubtopic = new Map<Subtopic, number>();

  rows.forEach((row, index) => {
    const record = perSkill.get(row.fundamentalSkill);
    if (record) record.total++;
    weight += row.difficulty;
    const hit = answers[index] === row.correctIndex;
    if (hit) {
      earned += row.difficulty;
      correct++;
      if (record) record.correct++;
    } else {
      missedBySubtopic.set(
        row.subtopic,
        (missedBySubtopic.get(row.subtopic) ?? 0) + row.difficulty,
      );
    }
  });

  const accuracy = weight > 0 ? earned / weight : 0;
  const centre = BAND_FLOOR + (BAND_CEILING - BAND_FLOOR) * accuracy;
  const bandLow = Math.max(BAND_FLOOR, Math.round(centre - BAND_MARGIN));
  const bandHigh = Math.min(BAND_CEILING, Math.round(centre + BAND_MARGIN));

  const ordered = FUNDAMENTAL_SKILLS.map(
    (skill) => perSkill.get(skill) as SkillResult,
  );
  const weakestSkill = ordered.reduce((worst, entry) => {
    const rate = entry.total > 0 ? entry.correct / entry.total : 0;
    const worstRate = worst.total > 0 ? worst.correct / worst.total : 0;
    return rate < worstRate ? entry : worst;
  }, ordered[0]).skill;

  let weakestSubtopic: Subtopic | null = null;
  let heaviest = 0;
  for (const [subtopic, missed] of missedBySubtopic) {
    if (SKILL_BY_SUBTOPIC[subtopic] !== weakestSkill) continue;
    if (missed > heaviest) {
      heaviest = missed;
      weakestSubtopic = subtopic;
    }
  }

  return {
    correct,
    total: rows.length,
    bandLow,
    bandHigh,
    perSkill: ordered,
    weakestSkill,
    weakestSubtopic,
  };
}

/** Guard against a caller posting a longer array than the set. */
export function normaliseAnswers(input: unknown): Array<number | null> {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, DIAGNOSTIC_LENGTH)
    .map((v) => (typeof v === "number" && v >= 0 && v <= 4 ? v : null));
}
