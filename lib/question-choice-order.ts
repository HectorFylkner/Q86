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
