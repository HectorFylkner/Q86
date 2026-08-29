/**
 * Error reporting, as one seam with no dependency.
 *
 * `SENTRY_DSN` is parsed for its ingest endpoint and the event is posted
 * as an envelope over `fetch`. That is deliberately less than an SDK
 * gives — no breadcrumbs, no source maps, no automatic instrumentation —
 * and it is enough for the thing that actually matters: knowing that a
 * webhook, a lifecycle run or a route threw, with the message and the
 * stack, without adding a runtime that hooks every module.
 *
 * With no DSN it logs. That is what every environment in this repository
 * does, so nothing here ever leaves the machine unless an operator sets
 * the variable.
 */

export type ErrorContext = {
  /** Where it happened: a route path, a script name, a job. */
  where: string;
  /** Never an email or a name — an account id at most. */
  userId?: string;
  extra?: Record<string, string | number | boolean | null>;
};

export function errorTrackingConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN);
}

/** `https://<key>@<host>/<project>` → the envelope endpoint plus the key. */
function parseDsn(
  dsn: string,
): { url: string; key: string; projectId: string } | null {
  try {
    const parsed = new URL(dsn);
    const projectId = parsed.pathname.replace(/^\//, "");
    if (!parsed.username || !projectId) return null;
    return {
      url: `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/`,
      key: parsed.username,
      projectId,
    };
  } catch {
    return null;
  }
}

function describe(error: unknown): { type: string; value: string; stack?: string } {
  if (error instanceof Error) {
    return {
      type: error.name || "Error",
      value: error.message,
      stack: error.stack,
    };
  }
  return { type: "Error", value: String(error) };
}

/**
 * Report an error. Never throws and never rejects: reporting a failure
 * must not become a second failure, and a caller in a catch block has
 * nowhere left to put one.
 */
export async function captureError(
  error: unknown,
  context: ErrorContext,
): Promise<void> {
  const described = describe(error);

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.error(
      `[error] ${context.where}: ${described.type}: ${described.value}` +
        (context.userId ? ` (user ${context.userId})` : ""),
      described.stack ?? "",
    );
    return;
  }

  const parsed = parseDsn(dsn);
  if (!parsed) {
    console.error(`[error] SENTRY_DSN is malformed; not reporting.`);
    console.error(`[error] ${context.where}:`, error);
    return;
  }

  const eventId = crypto.randomUUID().replace(/-/g, "");
  const sentAt = new Date().toISOString();
  const event = {
    event_id: eventId,
    timestamp: sentAt,
    platform: "node",
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? undefined,
    transaction: context.where,
    // The account id only; never the address, never the name. An error
    // report is not a place to widen what leaves the building.
    user: context.userId ? { id: context.userId } : undefined,
    tags: { where: context.where },
    extra: context.extra,
    exception: {
      values: [
        {
          type: described.type,
          value: described.value,
          stacktrace: described.stack
            ? { frames: [{ filename: described.stack.split("\n")[1] ?? "" }] }
            : undefined,
        },
      ],
    },
  };

  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: sentAt }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");

  try {
    await fetch(parsed.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.key}, sentry_client=q86/1`,
      },
      body: envelope,
    });
  } catch (reportingFailure) {
    console.error("[error] failed to report:", reportingFailure);
    console.error(`[error] ${context.where}:`, error);
  }
}
