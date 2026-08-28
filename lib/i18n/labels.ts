import type { Translate, Key } from "./index.ts";
import type { PatternCategoryKey } from "../generators/index.ts";
import type {
  Confidence,
  ContentDomain,
  Context,
  Difficulty,
  EditReason,
  ErrorType,
  FlagReason,
  FundamentalSkill,
  QuestionFormat,
  Subtopic,
} from "../taxonomy.ts";

/**
 * Localised labels for the taxonomy.
 *
 * The English constants stay in `lib/taxonomy.ts` because the authoring
 * harness and the seed scripts depend on them and must not depend on the
 * UI. These helpers are the user-facing side, and they are the only place
 * that builds a message key from a variable — `tests/unit/i18n.test.ts`
 * checks that every taxonomy value has a string in both catalogs, which is
 * what the type system cannot do here.
 */

const at = (t: Translate, prefix: string, value: string): string =>
  t(`${prefix}.${value}` as Key);

export const skillLabel = (t: Translate, v: FundamentalSkill): string =>
  at(t, "taxonomy.skill", v);

export const skillShortLabel = (t: Translate, v: FundamentalSkill): string =>
  at(t, "taxonomy.skillShort", v);

export const subtopicLabel = (t: Translate, v: Subtopic): string =>
  at(t, "taxonomy.subtopic", v);

export const contextLabel = (t: Translate, v: Context): string =>
  at(t, "taxonomy.context", v);

export const domainLabel = (t: Translate, v: ContentDomain): string =>
  at(t, "taxonomy.domain", v);

export const formatLabel = (t: Translate, v: QuestionFormat): string =>
  at(t, "taxonomy.format", v);

export const errorTypeLabel = (t: Translate, v: ErrorType): string =>
  at(t, "taxonomy.errorType", v);

export const confidenceLabel = (t: Translate, v: Confidence): string =>
  at(t, "taxonomy.confidence", v);

export const flagReasonLabel = (t: Translate, v: FlagReason): string =>
  at(t, "taxonomy.flagReason", v);

export const editReasonLabel = (t: Translate, v: EditReason): string =>
  at(t, "taxonomy.editReason", v);

export const difficultyLabel = (t: Translate, v: Difficulty): string =>
  at(t, "taxonomy.difficulty", String(v));

export const patternCategoryLabel = (
  t: Translate,
  v: PatternCategoryKey,
): string => at(t, "taxonomy.patternCategory", v);
