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

/**
 * Retry failed API calls max 2 times with backoff (§8.4), then rethrow so
 * callers can show a specific error state.
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
      lastError = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}
