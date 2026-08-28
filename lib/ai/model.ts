import { createAnthropic } from "@ai-sdk/anthropic";
import { getAppSetting } from "../db/app-settings.ts";

export const DEFAULT_MODEL = "claude-sonnet-4-6";

/** ANTHROPIC_BASE_URL is honored whether or not it includes the /v1
 *  path segment the SDK expects (some environments export just the host). */
function resolveBaseURL(): string | undefined {
  const raw = process.env.ANTHROPIC_BASE_URL;
  if (!raw) return undefined;
  const trimmed = raw.replace(/\/+$/, "");
  return /\/v\d+$/.test(trimmed) ? trimmed : `${trimmed}/v1`;
}

const anthropic = createAnthropic({ baseURL: resolveBaseURL() });

/** app_settings.model override → ANTHROPIC_MODEL env → default. The model
 *  is instance configuration, not a user preference: a subscriber must not
 *  be able to redirect the operator's spend to a different model. */
export async function getModelId(): Promise<string> {
  try {
    const value = await getAppSetting("model");
    if (value) return value;
  } catch {
    // app_settings may not exist before the first migration — fall through
  }
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

export async function getModel() {
  return anthropic(await getModelId());
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
