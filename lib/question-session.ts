import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  sessionItems,
  sessions,
  type Question,
  type Session,
  type SessionItem,
} from "./db/schema.ts";
import {
  buildQuestionChoiceRoster,
  isChoiceOrder,
  parsePersistedQuestionChoiceRoster,
  questionInDisplayOrder,
  type PersistedQuestionChoiceRoster,
} from "./question-choice-order.ts";
import type { SessionMode } from "./taxonomy.ts";

export const SESSION_CHOICE_ROSTER_KEY = "choiceOrderRoster" as const;

export type LoadedQuestionSession = {
  session: Session;
  questionIds: readonly number[];
  choiceOrderRoster: PersistedQuestionChoiceRoster;
  /** Empty only for sessions created before immutable session items existed. */
  sessionItems: readonly SessionItem[];
};

/**
 * Persist a question roster and its answer order atomically with the session,
 * then return display-ordered clones. Canonical question rows never change.
 */
export async function createQuestionSession(input: {
  mode: SessionMode;
  questions: readonly Question[];
  config?: Record<string, unknown>;
  /** Optional blueprint-owned slot names, aligned one-for-one with questions. */
  blueprintSlots?: readonly string[];
  /** Deterministic injection for integration tests; production uses a UUID. */
  sessionSeed?: string;
}): Promise<{ session: Session; questions: Question[] }> {
  if (input.questions.length === 0) {
    throw new Error("A question session cannot be created without questions.");
  }
  const questionIds = input.questions.map((question) => question.id);
  const choiceOrderRoster = buildQuestionChoiceRoster(
    input.questions,
    input.sessionSeed ?? randomUUID(),
  );
  const blueprintSlots =
    input.blueprintSlots ??
    input.questions.map(
      (_, position) => `roster.${String(position + 1).padStart(3, "0")}`,
    );
  if (
    blueprintSlots.length !== input.questions.length ||
    blueprintSlots.some((slot) => slot.trim().length === 0) ||
    new Set(blueprintSlots).size !== blueprintSlots.length
  ) {
    throw new Error(
      "Session blueprint slots must be non-empty, unique, and aligned with the question roster.",
    );
  }
  const config = {
    ...(input.config ?? {}),
    questionIds,
    [SESSION_CHOICE_ROSTER_KEY]: choiceOrderRoster,
  };
  const session = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(sessions)
      .values({ mode: input.mode, config })
      .returning()
      .get();
    await tx
      .insert(sessionItems)
      .values(
        input.questions.map((question, position) => {
          const rosterEntry =
            choiceOrderRoster.byQuestionId[String(question.id)];
          if (!rosterEntry) {
            throw new Error(
              `Question ${question.id} is missing from the new session roster.`,
            );
          }
          return {
            sessionId: inserted.id,
            position,
            questionId: question.id,
            questionUid: question.uid?.trim() || rosterEntry.questionKey,
            questionContentVersion: question.contentVersion,
            blueprintSlot: blueprintSlots[position],
            choiceOrderAlgorithm: rosterEntry.order.algorithm,
            displayToCanonical: rosterEntry.order.displayToCanonical,
          };
        }),
      )
      .run();
    return inserted;
  });

  return {
    session,
    questions: input.questions.map((question) =>
      questionInDisplayOrder(question, choiceOrderRoster),
    ),
  };
}

/** Load and fully validate the immutable ordering contract for a session. */
export async function loadQuestionSession(
  sessionId: number,
  expectedMode?: SessionMode | readonly SessionMode[],
): Promise<LoadedQuestionSession> {
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    throw new Error(`Invalid session id: ${sessionId}`);
  }
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .get();
  if (session == null) throw new Error(`Session ${sessionId} not found.`);

  const allowedModes =
    expectedMode == null
      ? null
      : Array.isArray(expectedMode)
        ? expectedMode
        : [expectedMode];
  if (allowedModes != null && !allowedModes.includes(session.mode)) {
    throw new Error(
      `Session ${sessionId} is ${session.mode}, not ${allowedModes.join(" or ")}.`,
    );
  }

  const questionIds = parseQuestionIds(session.config.questionIds);
  const choiceOrderRoster = parsePersistedQuestionChoiceRoster(
    session.config[SESSION_CHOICE_ROSTER_KEY],
  );
  if (choiceOrderRoster == null) {
    throw new Error(`Session ${sessionId} has no valid choice-order roster.`);
  }
  const rosterIds = Object.keys(choiceOrderRoster.byQuestionId)
    .map(Number)
    .sort((a, b) => a - b);
  const configuredIds = [...questionIds].sort((a, b) => a - b);
  if (
    rosterIds.length !== configuredIds.length ||
    rosterIds.some((id, index) => id !== configuredIds[index])
  ) {
    throw new Error(`Session ${sessionId} has a mismatched question roster.`);
  }

  const persistedSessionItems = await db
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, sessionId))
    .orderBy(asc(sessionItems.position))
    .all();
  // Sessions created before curriculum-v3 remain readable from their stored
  // JSON roster. New sessions must have a complete, immutable relational copy.
  if (persistedSessionItems.length > 0) {
    if (persistedSessionItems.length !== questionIds.length) {
      throw new Error(`Session ${sessionId} has an incomplete item roster.`);
    }
    for (const [position, item] of persistedSessionItems.entries()) {
      const questionId = questionIds[position];
      const rosterEntry = choiceOrderRoster.byQuestionId[String(questionId)];
      const identity = rosterEntry
        ? parseRosterQuestionIdentity(rosterEntry.questionKey)
        : null;
      if (
        item.position !== position ||
        item.questionId !== questionId ||
        rosterEntry == null ||
        identity == null ||
        item.questionUid !== identity.persistedUid ||
        item.questionContentVersion !== identity.contentVersion ||
        item.choiceOrderAlgorithm !== rosterEntry.order.algorithm ||
        !isChoiceOrder(item.displayToCanonical) ||
        item.displayToCanonical.some(
          (canonicalIndex, displayIndex) =>
            canonicalIndex !==
            rosterEntry.order.displayToCanonical[displayIndex],
        )
      ) {
        throw new Error(`Session ${sessionId} has a corrupted item roster.`);
      }
    }
  }

  return {
    session,
    questionIds,
    choiceOrderRoster,
    sessionItems: persistedSessionItems,
  };
}

function parseRosterQuestionIdentity(
  questionKey: string,
): { persistedUid: string; contentVersion: number } | null {
  const uid = questionKey.match(
    /^uid:(.+):v([1-9]\d*):f(?:problem_solving|data_sufficiency)$/,
  );
  if (uid) {
    return { persistedUid: uid[1], contentVersion: Number(uid[2]) };
  }
  const local = questionKey.match(
    /^db:([1-9]\d*):v([1-9]\d*):f(?:problem_solving|data_sufficiency)$/,
  );
  if (local) {
    return { persistedUid: questionKey, contentVersion: Number(local[2]) };
  }
  return null;
}

function parseQuestionIds(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((id) => Number.isSafeInteger(id) && Number(id) > 0)
  ) {
    throw new Error("Session questionIds must be a non-empty integer roster.");
  }
  const ids = value.map(Number);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Session questionIds cannot contain duplicates.");
  }
  return ids;
}
