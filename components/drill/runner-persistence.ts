export type AttemptSaveState = "saving" | "saved" | "failed";

export type PersistedAttemptState = {
  attemptId: number | null;
  saveState: AttemptSaveState;
};

/** Advancing is safe only after the server has returned the persisted row ID. */
export function attemptIsPersisted(
  result: PersistedAttemptState | null | undefined,
): result is PersistedAttemptState & { attemptId: number; saveState: "saved" } {
  return result?.saveState === "saved" && result.attemptId != null;
}
