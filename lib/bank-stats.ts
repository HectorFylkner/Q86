import type { QuestionFormat, Subtopic } from "./taxonomy.ts";

export type BankStatsQuestion = {
  subtopic: Subtopic;
  format: QuestionFormat;
  fundamental_skill?: string;
  difficulty?: number;
  correct_index: number;
};

export type BankStats = {
  total: number;
  problemSolving: number;
  dataSufficiency: number;
  bySubtopic: Record<string, number>;
  bySkill: Record<string, number>;
  byDifficulty: Record<string, number>;
  canonicalKeyPositions: {
    problemSolving: number[];
    dataSufficiency: number[];
  };
};

/** Derive documentation and audit counts from the bank itself. */
export function computeBankStats(questions: BankStatsQuestion[]): BankStats {
  const bySubtopic: Record<string, number> = {};
  const bySkill: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const problemSolving = [0, 0, 0, 0, 0];
  const dataSufficiency = [0, 0, 0, 0, 0];

  for (const question of questions) {
    bySubtopic[question.subtopic] = (bySubtopic[question.subtopic] ?? 0) + 1;
    if (question.fundamental_skill) {
      bySkill[question.fundamental_skill] =
        (bySkill[question.fundamental_skill] ?? 0) + 1;
    }
    if (question.difficulty != null) {
      const key = `D${question.difficulty}`;
      byDifficulty[key] = (byDifficulty[key] ?? 0) + 1;
    }
    const target =
      question.format === "problem_solving" ? problemSolving : dataSufficiency;
    if (Number.isInteger(question.correct_index) && question.correct_index >= 0 && question.correct_index < 5) {
      target[question.correct_index]++;
    }
  }

  return {
    total: questions.length,
    problemSolving: problemSolving.reduce((sum, n) => sum + n, 0),
    dataSufficiency: dataSufficiency.reduce((sum, n) => sum + n, 0),
    bySubtopic,
    bySkill,
    byDifficulty,
    canonicalKeyPositions: { problemSolving, dataSufficiency },
  };
}
