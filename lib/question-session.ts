import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  sessions,
  type Question,
  type Session,
} from "./db/schema.ts";
import {
  buildQuestionChoiceRoster,
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
};

/**
 * Persist a question roster and its answer order atomically with the session,
 * then return display-ordered clones. Canonical question rows never change.
 */
export async function createQuestionSession(input: {
  mode: SessionMode;
  questions: readonly Question[];
  config?: Record<string, unknown>;
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
  const config = {
    ...(input.config ?? {}),
    questionIds,
    [SESSION_CHOICE_ROSTER_KEY]: choiceOrderRoster,
  };
  const session = await db
    .insert(sessions)
    .values({ mode: input.mode, config })
    .returning()
    .get();

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

  return { session, questionIds, choiceOrderRoster };
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
