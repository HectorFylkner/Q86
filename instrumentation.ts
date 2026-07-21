type BootstrapLogger = Pick<Console, "error" | "info">;

function errorSummary(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { message: String(error) };
  const coded = error as Error & { code?: unknown; cause?: unknown };
  const cause = coded.cause as { code?: unknown } | undefined;
  return {
    name: error.name,
    message: error.message,
    code: coded.code,
    causeCode: cause?.code,
  };
}

/** Keep a transient database/network failure from aborting Next worker startup.
 * DB-backed requests may still fail, but login and other DB-free routes survive. */
export async function runDatabaseBootstrap(
  ensureDbReady: () => Promise<void>,
  logger: BootstrapLogger = console,
): Promise<boolean> {
  try {
    await ensureDbReady();
    logger.info("Q86 bootstrap: database ready.");
    return true;
  } catch (error) {
    logger.error(
      "Q86 bootstrap: database unavailable; worker started in degraded mode.",
      errorSummary(error),
    );
    return false;
  }
}

/** Runs once per Node worker boot (Next.js instrumentation hook). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDbReady } = await import("./lib/db/bootstrap.ts");
    await runDatabaseBootstrap(ensureDbReady);
  }
}
