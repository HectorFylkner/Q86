import { z } from "zod";
import {
  ALL_SUBTOPICS,
  CONTENT_DOMAINS,
  CONTEXTS,
  ERROR_TYPES,
  FUNDAMENTAL_SKILLS,
  type Subtopic,
} from "../taxonomy.ts";

/** What the generator model returns (§8.1). Taxonomy fields we dictate in
 *  the request are not echoed back; content_domain is the model's call. */
export const generatedQuestionSchema = z.object({
  content_domain: z.enum(CONTENT_DOMAINS),
  stem_md: z
    .string()
    .min(20)
    .describe("The question stem. For DS, includes statements (1) and (2)."),
  choices: z
    .array(z.string().min(1))
    .length(5)
    .describe("Exactly five answer choices in canonical order."),
  correct_index: z.number().int().min(0).max(4),
  fastest_path_md: z.string().min(10),
  solution_md: z.string().min(30),
  traps: z
    .array(
      z.object({
        choice_index: z.number().int().min(0).max(4),
        mistake: z
          .string()
          .min(5)
          .describe("One sentence naming the exact mistake this choice encodes."),
      }),
    )
    .min(4)
    .max(5)
    .describe("One entry per wrong choice — all four wrong indexes covered."),
  numeric_check: z
    .string()
    .nullable()
    .describe(
      "mathjs expression equal to the correct choice's numeric value, or null.",
    ),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

/** What the independent verifier returns (§8.2). */
export const verifierResultSchema = z.object({
  answer_index: z.number().int().min(0).max(4),
  one_line_reason: z.string().min(3),
});

export type VerifierResult = z.infer<typeof verifierResultSchema>;

/** What the post-mortem coach returns (§8.3). */
export const coachResponseSchema = z.object({
  error_type: z.enum(ERROR_TYPES),
  error_subtag: z.enum(ALL_SUBTOPICS as [Subtopic, ...Subtopic[]]),
  divergence_point_md: z
    .string()
    .min(10)
    .describe(
      "The first written line where the work leaves the correct path, or a plain statement that the work is illegible plus what to re-shoot.",
    ),
  diagnosis_md: z.string().min(10),
  fastest_path_md: z.string().min(10),
  trigger_cue_md: z.string().min(10),
  prescription: z.object({
    subtopic: z.enum(ALL_SUBTOPICS as [Subtopic, ...Subtopic[]]),
    count: z.number().int().min(5).max(15),
  }),
  takeaway_15_words: z.string().min(3),
});

export type CoachResponse = z.infer<typeof coachResponseSchema>;

/** Parsed official score report (§F9). Everything optional-ish: reports
 *  vary, and absent data must stay absent — never invented. */
export const parsedReportSchema = z.object({
  test_date: z
    .string()
    .nullable()
    .describe("Exam date as YYYY-MM-DD when present, else null."),
  total_score: z.number().nullable(),
  sections: z.array(
    z.object({
      section: z.enum(["quant", "verbal", "data_insights"]),
      scaled_score: z.number().nullable(),
      percentile: z.number().min(0).max(100).nullable(),
    }),
  ),
  fundamental_skills: z
    .array(
      z.object({
        skill: z.enum(FUNDAMENTAL_SKILLS),
        percentile: z.number().min(0).max(100),
      }),
    )
    .describe("Quant fundamental-skill percentiles found in the report."),
  content_domains: z.array(
    z.object({
      domain: z.enum(CONTENT_DOMAINS),
      percentile: z.number().min(0).max(100),
    }),
  ),
  contexts: z.array(
    z.object({
      context: z.enum(CONTEXTS),
      percentile: z.number().min(0).max(100),
    }),
  ),
  per_question_rows: z
    .array(
      z.object({
        number: z.number().int(),
        time_minutes: z.number().nullable(),
        result: z.enum(["correct", "incorrect"]).nullable(),
      }),
    )
    .describe("Quant per-question timing rows when present, else empty."),
});

export type ParsedReport = z.infer<typeof parsedReportSchema>;
