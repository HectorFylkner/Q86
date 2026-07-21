import type { QuestionFormat } from "./taxonomy.ts";

export const CHOICE_ORDER_ALGORITHM = "q86-choice-order-v1" as const;
export type ChoiceIndex = 0 | 1 | 2 | 3 | 4;
export type ChoiceOrder = readonly [
  ChoiceIndex,
  ChoiceIndex,
  ChoiceIndex,
  ChoiceIndex,
  ChoiceIndex,
];

/** Persist this object in a session config; do not recompute it mid-session. */
export type PersistedChoiceOrder = {
  algorithm: typeof CHOICE_ORDER_ALGORITHM;
  /** Each display position points to the canonical bank choice index. */
  displayToCanonical: ChoiceOrder;
};

export type PersistedSessionChoiceOrders = {
  version: 1;
  seed: string;
  byQuestionUid: Record<string, PersistedChoiceOrder>;
};

/**
 * Identity evidence stored beside a question's order in a real session.
 *
 * The database id lets the server address the roster without trusting a
 * client-supplied UID. The content-aware key makes an editorial change during
 * an open session fail closed instead of scoring an answer against a different
 * answer key. Generated questions do not have a UID yet, so their immutable
 * database id is the safe fallback.
 */
export type ChoiceOrderQuestionIdentity = {
  id: number;
  uid: string | null;
  contentVersion: number;
  format: QuestionFormat;
};

export type PersistedQuestionChoiceRosterEntry = {
  questionKey: string;
  order: PersistedChoiceOrder;
};

/** Persist exactly one of these objects in every question-bearing session. */
export type PersistedQuestionChoiceRoster = {
  version: 1;
  seed: string;
  byQuestionId: Record<string, PersistedQuestionChoiceRosterEntry>;
};

type PresentableQuestion = ChoiceOrderQuestionIdentity & {
  choices: string[];
  correctIndex: number;
  trapMap: Record<string, string>;
};

const IDENTITY_ORDER: ChoiceOrder = [0, 1, 2, 3, 4];

function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function isChoiceOrder(value: unknown): value is ChoiceOrder {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every(Number.isInteger) &&
    new Set(value).size === 5 &&
    value.every((index) => index >= 0 && index <= 4)
  );
}

export function parsePersistedChoiceOrder(
  value: unknown,
): PersistedChoiceOrder | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = value as Partial<PersistedChoiceOrder>;
  if (
    candidate.algorithm !== CHOICE_ORDER_ALGORITHM ||
    !isChoiceOrder(candidate.displayToCanonical)
  )
    return null;
  return {
    algorithm: CHOICE_ORDER_ALGORITHM,
    displayToCanonical: [...candidate.displayToCanonical] as ChoiceOrder,
  };
}

/** Stable for one installed content version, including UID-less candidates. */
export function questionChoiceKey(
  question: Pick<
    ChoiceOrderQuestionIdentity,
    "id" | "uid" | "contentVersion" | "format"
  >,
): string {
  if (!Number.isSafeInteger(question.id) || question.id <= 0) {
    throw new RangeError(
      `Question id must be a positive safe integer: ${question.id}`,
    );
  }
  if (
    !Number.isSafeInteger(question.contentVersion) ||
    question.contentVersion <= 0
  ) {
    throw new RangeError(
      `Question content version must be a positive safe integer: ${question.contentVersion}`,
    );
  }
  const uid = question.uid?.trim();
  return uid
    ? `uid:${uid}:v${question.contentVersion}:f${question.format}`
    : `db:${question.id}:v${question.contentVersion}:f${question.format}`;
}

/**
 * Deterministic, session-scoped PS ordering. Data Sufficiency remains in the
 * canonical GMAT order because its choices encode logical sufficiency states.
 */
export function createChoiceOrder(input: {
  format: QuestionFormat;
  questionUid: string;
  sessionSeed: string;
}): PersistedChoiceOrder {
  if (input.format === "data_sufficiency") {
    return {
      algorithm: CHOICE_ORDER_ALGORITHM,
      displayToCanonical: [...IDENTITY_ORDER],
    };
  }
  const random = mulberry32(
    hash32(
      `${CHOICE_ORDER_ALGORITHM}\u0000${input.sessionSeed}\u0000${input.questionUid}`,
    ),
  );
  const order: ChoiceIndex[] = [0, 1, 2, 3, 4];
  for (let index = order.length - 1; index > 0; index--) {
    const swapWith = Math.floor(random() * (index + 1));
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
  }
  return {
    algorithm: CHOICE_ORDER_ALGORITHM,
    displayToCanonical: order as unknown as ChoiceOrder,
  };
}

export function buildSessionChoiceOrders(
  questions: ReadonlyArray<{
    uid: string;
    format: QuestionFormat;
  }>,
  sessionSeed: string,
): PersistedSessionChoiceOrders {
  return {
    version: 1,
    seed: sessionSeed,
    byQuestionUid: Object.fromEntries(
      questions.map((question) => [
        question.uid,
        createChoiceOrder({
          format: question.format,
          questionUid: question.uid,
          sessionSeed,
        }),
      ]),
    ),
  };
}

/** Build the persisted, database-addressable roster used by app sessions. */
export function buildQuestionChoiceRoster(
  questions: readonly ChoiceOrderQuestionIdentity[],
  sessionSeed: string,
): PersistedQuestionChoiceRoster {
  if (sessionSeed.trim().length === 0) {
    throw new Error("A choice-order session seed cannot be empty.");
  }
  const byQuestionId: Record<string, PersistedQuestionChoiceRosterEntry> = {};
  for (const question of questions) {
    const id = String(question.id);
    if (byQuestionId[id] != null) {
      throw new Error(
        `Question ${question.id} appears twice in one session roster.`,
      );
    }
    const questionKey = questionChoiceKey(question);
    byQuestionId[id] = {
      questionKey,
      order: createChoiceOrder({
        format: question.format,
        questionUid: questionKey,
        sessionSeed,
      }),
    };
  }
  return { version: 1, seed: sessionSeed, byQuestionId };
}

export function parsePersistedQuestionChoiceRoster(
  value: unknown,
): PersistedQuestionChoiceRoster | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = value as Partial<PersistedQuestionChoiceRoster>;
  if (
    candidate.version !== 1 ||
    typeof candidate.seed !== "string" ||
    candidate.seed.trim().length === 0 ||
    candidate.byQuestionId == null ||
    typeof candidate.byQuestionId !== "object" ||
    Array.isArray(candidate.byQuestionId)
  ) {
    return null;
  }

  const byQuestionId: Record<string, PersistedQuestionChoiceRosterEntry> = {};
  for (const [questionId, rawEntry] of Object.entries(
    candidate.byQuestionId,
  )) {
    const numericQuestionId = Number(questionId);
    if (
      !/^[1-9]\d*$/.test(questionId) ||
      !Number.isSafeInteger(numericQuestionId) ||
      rawEntry == null ||
      typeof rawEntry !== "object"
    ) {
      return null;
    }
    const entry = rawEntry as Partial<PersistedQuestionChoiceRosterEntry>;
    const order = parsePersistedChoiceOrder(entry.order);
    if (
      typeof entry.questionKey !== "string" ||
      entry.questionKey.length === 0 ||
      order == null
    ) {
      return null;
    }
    byQuestionId[questionId] = { questionKey: entry.questionKey, order };
  }

  return { version: 1, seed: candidate.seed, byQuestionId };
}

/**
 * Resolve and validate the persisted order for the current installed question.
 * A missing entry or content-version mismatch is an integrity error, never an
 * invitation to silently recompute a new order.
 */
export function choiceOrderForQuestion(
  roster: PersistedQuestionChoiceRoster,
  question: ChoiceOrderQuestionIdentity,
): PersistedChoiceOrder {
  const entry = roster.byQuestionId[String(question.id)];
  if (entry == null) {
    throw new Error(`Question ${question.id} is not in this session roster.`);
  }
  const currentKey = questionChoiceKey(question);
  if (entry.questionKey !== currentKey) {
    throw new Error(
      `Question ${question.id} changed after this session started; start a new session.`,
    );
  }
  if (
    question.format === "data_sufficiency" &&
    entry.order.displayToCanonical.some((index, position) => index !== position)
  ) {
    throw new Error(
      `Data Sufficiency question ${question.id} has a non-canonical choice order.`,
    );
  }
  return entry.order;
}

/** Return a clone whose answer-bearing fields all use display indexes. */
export function questionInDisplayOrder<T extends PresentableQuestion>(
  question: T,
  roster: PersistedQuestionChoiceRoster,
): T {
  const order = choiceOrderForQuestion(roster, question);
  return {
    ...question,
    choices: choicesInDisplayOrder(question.choices, order),
    correctIndex: displayIndexFromCanonical(question.correctIndex, order),
    trapMap: trapMapInDisplayOrder(question.trapMap, order),
  };
}

/** Convert a submitted display position back to the canonical bank index. */
export function canonicalIndexForQuestion(
  displayIndex: number,
  question: ChoiceOrderQuestionIdentity,
  roster: PersistedQuestionChoiceRoster,
): ChoiceIndex {
  return canonicalIndexFromDisplay(
    displayIndex,
    choiceOrderForQuestion(roster, question),
  );
}

/** Recover the position originally shown for canonical attempt history. */
export function displayIndexForQuestion(
  canonicalIndex: number,
  question: ChoiceOrderQuestionIdentity,
  roster: PersistedQuestionChoiceRoster,
): ChoiceIndex {
  return displayIndexFromCanonical(
    canonicalIndex,
    choiceOrderForQuestion(roster, question),
  );
}

function assertDisplayIndex(index: number): asserts index is ChoiceIndex {
  if (!Number.isInteger(index) || index < 0 || index > 4) {
    throw new RangeError(`Choice index must be an integer from 0 through 4: ${index}`);
  }
}

export function canonicalIndexFromDisplay(
  displayIndex: number,
  order: PersistedChoiceOrder,
): ChoiceIndex {
  assertDisplayIndex(displayIndex);
  return order.displayToCanonical[displayIndex];
}

export function displayIndexFromCanonical(
  canonicalIndex: number,
  order: PersistedChoiceOrder,
): ChoiceIndex {
  assertDisplayIndex(canonicalIndex);
  const displayIndex = order.displayToCanonical.indexOf(canonicalIndex);
  assertDisplayIndex(displayIndex);
  return displayIndex;
}

export function choicesInDisplayOrder<T>(
  canonicalChoices: readonly T[],
  order: PersistedChoiceOrder,
): T[] {
  if (canonicalChoices.length !== 5) {
    throw new RangeError(`Expected 5 canonical choices, received ${canonicalChoices.length}.`);
  }
  return order.displayToCanonical.map((index) => canonicalChoices[index]);
}

export function trapMapInDisplayOrder(
  canonicalTrapMap: Readonly<Record<string, string>>,
  order: PersistedChoiceOrder,
): Record<string, string> {
  return Object.fromEntries(
    order.displayToCanonical.flatMap((canonicalIndex, displayIndex) => {
      const trap = canonicalTrapMap[String(canonicalIndex)];
      return trap == null ? [] : [[String(displayIndex), trap]];
    }),
  );
}
