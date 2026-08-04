import { and, eq, isNotNull, notInArray, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, sessions } from "./db/schema.ts";
import { ERROR_TYPES, type ErrorType } from "./taxonomy.ts";

/**
 * How often the platform's diagnosis was the reader's diagnosis.
 *
 * `attributeError()`'s weights are hand-set. They encode defensible
 * reasoning and are tested for the properties that matter — a time sink is
 * never time pressure, thin evidence reports uncertainty — but the specific
 * numbers have never been checked against anything. The only thing that can
 * ever check them is the reader disagreeing: an override is a labelled
 * example, produced by someone who had the question in front of them.
 *
 * Since W13 every tag carries the suggestion it was made against, so those
 * examples exist. This is the read side: agreement overall, agreement split
 * by how confident the suggestion was, and a confusion matrix of suggested
 * against chosen — which is the thing that actually names *which* weight is
 * wrong, because a systematic "suggests setup, reader says misread" is a
 * different repair from scattered disagreement.
 *
 * Two honesty rules are built in rather than left to the reader:
 *   - casual attempts are excluded, like every other statistic here;
 *   - attempts from `scripts/dev-seed-history.ts` are excluded by default.
 *     That fixture draws most of its error types from a weighted random mix,
 *     so agreement against them sits near chance by construction and says
 *     nothing about the weights. Counting them would be exactly the circular
 *     measurement the difficulty-validation finding warns about;
 *   - tags written before the suggestion was recorded are counted and
 *     reported separately as `unrecorded`, never silently dropped, because
 *     a denominator that quietly shrinks is how a number starts lying.
 */

export type SuggestionAgreement = {
  /** Tags whose suggestion was recorded — the labelled examples. */
  labelled: number;
  /** …of those, how many kept the suggestion. */
  accepted: number;
  /** …and how many overrode it. */
  overridden: number;
  /** Tags written before the suggestion was recorded, or with none to record. */
  unrecorded: number;
  /** accepted / labelled, or null below the floor where it would mislead. */
  agreement: number | null;
  /** Agreement among suggestions the platform called confident (≥ 40%). */
  confidentAgreement: number | null;
  confidentLabelled: number;
  /** Agreement among suggestions the platform itself flagged as uncertain. */
  uncertainAgreement: number | null;
  uncertainLabelled: number;
  /** confusion[suggested][chosen], both over the six error types. */
  confusion: Record<ErrorType, Record<ErrorType, number>>;
  /** The single most common disagreement, when there is one. */
  worstConfusion: {
    suggested: ErrorType;
    chosen: ErrorType;
    count: number;
  } | null;
};

/**
 * Below this many labelled examples the agreement rate is noise, and the UI
 * says "not enough yet" rather than printing a percentage nobody should act
 * on. Ten overrides is not evidence about a weight; it is ten opinions.
 */
export const MIN_LABELLED = 25;

/** The bar `attributeError()` itself uses to decide it is unsure. */
const CERTAINTY_BAR = 0.4;

export async function suggestionAgreement(
  { includeSynthetic = false }: { includeSynthetic?: boolean } = {},
): Promise<SuggestionAgreement> {
  const syntheticSessions = includeSynthetic
    ? []
    : (
        await db.select({ id: sessions.id, config: sessions.config }).from(sessions).all()
      )
        .filter((s) => (s.config as { synthetic?: string } | null)?.synthetic != null)
        .map((s) => s.id);

  const rows = await db
    .select({
      errorType: attempts.errorType,
      suggestedErrorType: attempts.suggestedErrorType,
      suggestedConfidence: attempts.suggestedConfidence,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.focus, "focused"),
        isNotNull(attempts.errorType),
        syntheticSessions.length > 0
          ? notInArray(attempts.sessionId, syntheticSessions)
          : sql`1 = 1`,
      ),
    )
    .all();

  const confusion = Object.fromEntries(
    ERROR_TYPES.map((s) => [
      s,
      Object.fromEntries(ERROR_TYPES.map((c) => [c, 0])) as Record<ErrorType, number>,
    ]),
  ) as Record<ErrorType, Record<ErrorType, number>>;

  let labelled = 0;
  let accepted = 0;
  let unrecorded = 0;
  let confidentLabelled = 0;
  let confidentAccepted = 0;
  let uncertainLabelled = 0;
  let uncertainAccepted = 0;

  for (const row of rows) {
    const chosen = row.errorType as ErrorType | null;
    const suggested = row.suggestedErrorType as ErrorType | null;
    if (chosen == null) continue;
    if (suggested == null) {
      unrecorded++;
      continue;
    }
    labelled++;
    const agreed = suggested === chosen;
    if (agreed) accepted++;
    if (confusion[suggested]?.[chosen] != null) confusion[suggested][chosen]++;

    if ((row.suggestedConfidence ?? 0) >= CERTAINTY_BAR) {
      confidentLabelled++;
      if (agreed) confidentAccepted++;
    } else {
      uncertainLabelled++;
      if (agreed) uncertainAccepted++;
    }
  }

  let worstConfusion: SuggestionAgreement["worstConfusion"] = null;
  for (const suggested of ERROR_TYPES) {
    for (const chosen of ERROR_TYPES) {
      if (suggested === chosen) continue;
      const count = confusion[suggested][chosen];
      if (count > (worstConfusion?.count ?? 0)) {
        worstConfusion = { suggested, chosen, count };
      }
    }
  }

  const rate = (hit: number, n: number) => (n >= MIN_LABELLED ? hit / n : null);

  return {
    labelled,
    accepted,
    overridden: labelled - accepted,
    unrecorded,
    agreement: rate(accepted, labelled),
    confidentAgreement: rate(confidentAccepted, confidentLabelled),
    confidentLabelled,
    uncertainAgreement: rate(uncertainAccepted, uncertainLabelled),
    uncertainLabelled,
    confusion,
    worstConfusion,
  };
}
