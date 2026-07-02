import { anthropic } from "@ai-sdk/anthropic";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { settings } from "../db/schema.ts";

export const DEFAULT_MODEL = "claude-sonnet-4-6";

/** settings.model override → ANTHROPIC_MODEL env → default. */
export function getModelId(): string {
  try {
    const row = db
      .select()
      .from(settings)
      .where(eq(settings.key, "model"))
      .get();
    if (row?.value) return row.value;
  } catch {
    // settings table may not exist before db:push — fall through
  }
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

export function getModel() {
  return anthropic(getModelId());
}

/** Deterministic failures that a retry cannot fix (bad key, bad request). */
function isNonRetryable(e: unknown): boolean {
  const status = (e as { statusCode?: number })?.statusCode;
  if (status == null) return false;
  return status < 500 && status !== 408 && status !== 429;
}

/**
 * Retry failed API calls max 2 times with backoff (§8.4), then rethrow so
 * callers can show a specific error state. Non-transient errors (auth,
 * invalid request) are rethrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseMs = 1500 }: { retries?: number; baseMs?: number } = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (isNonRetryable(e)) throw e;
      lastError = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
