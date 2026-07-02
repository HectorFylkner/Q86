import { z } from "zod";
import { CONTENT_DOMAINS } from "../taxonomy.ts";

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
