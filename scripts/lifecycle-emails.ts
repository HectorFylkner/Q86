import { ensureDbReady } from "../lib/db/bootstrap.ts";
import { runLifecycleEmails } from "../lib/retention/lifecycle.ts";
import { transportConfigured, fromAddress } from "../lib/email/transport.ts";

/**
 * One pass of the lifecycle mail. Intended to run from a scheduler once an
 * hour; running it more often is harmless, because every send is claimed
 * in `email_log` by a primary key before it goes out.
 *
 *   pnpm email:lifecycle            # send (or log, without a key)
 *   pnpm email:lifecycle --dry-run  # decide and print, deliver nothing
 *
 * With no RESEND_API_KEY the messages are written to stdout rather than
 * delivered, which is what every environment in this repository does.
 */

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  await ensureDbReady();

  if (dryRun) {
    // A dry run must not claim the window, or the real run that follows
    // would find every message already sent. So it refuses rather than
    // pretending: the honest way to preview is a test.
    console.log(
      "--dry-run is not supported: every send is claimed in email_log " +
        "before delivery, so a preview would consume the window and " +
        "suppress the real message. Run the unit tests instead " +
        "(tests/unit/retention.test.ts), which assert the same decisions.",
    );
    process.exitCode = 2;
    return;
  }

  console.log(
    transportConfigured()
      ? `Delivering as ${fromAddress()}.`
      : "No RESEND_API_KEY: messages will be printed, not delivered.",
  );

  const sent = await runLifecycleEmails();
  if (sent.length === 0) {
    console.log("Nothing to send.");
    return;
  }
  const byKind = new Map<string, number>();
  for (const item of sent) {
    byKind.set(item.kind, (byKind.get(item.kind) ?? 0) + 1);
  }
  for (const [kind, count] of [...byKind].sort()) {
    console.log(`${kind}: ${count}`);
  }
  console.log(`${sent.length} message(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
