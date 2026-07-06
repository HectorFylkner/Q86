/** Runs once per server boot (Next.js instrumentation hook). Provisions
 *  an empty database — schema + the 360-question bank — before the first
 *  request, which is what makes Vercel deployment zero-command. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDbReady } = await import("./lib/db/bootstrap.ts");
    await ensureDbReady();
  }
}
