import { createHash } from "node:crypto";

export const SEED_QUESTION_UID_PATTERN =
  /^q86-seed-[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{12}$/;

type SeedQuestionIdentityInput = {
  format: string;
  subtopic: string;
  stem_md: string;
};

/**
 * Creates a non-positional identifier for a newly authored seed question.
 *
 * The result is written into the bank once and must then be treated as
 * immutable: later stem edits keep the persisted UID and increment the
 * question's content_version. This helper is only for first assignment.
 */
export function deriveSeedQuestionUid(input: SeedQuestionIdentityInput): string {
  const subtopic = input.subtopic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const fingerprint = createHash("sha256")
    .update([input.format, input.subtopic, input.stem_md].join("\u0000"))
    .digest("hex")
    .slice(0, 12);
  return `q86-seed-${subtopic}-${fingerprint}`;
}

