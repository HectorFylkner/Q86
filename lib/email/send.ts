/**
 * Outbound mail.
 *
 * Every message in the product goes through `sendEmail`. Where it actually
 * goes is decided in `./transport.ts` by environment: with no
 * `RESEND_API_KEY` the message is logged and kept in memory, which is what
 * tests assert on and what makes "this build sends nothing" a property of
 * the configuration rather than a promise.
 *
 * The in-memory ring is deliberately small and is not a delivery record —
 * `email_log` is, and it is what the lifecycle dispatcher reads to avoid
 * sending the same message twice.
 */

import { deliver } from "./transport.ts";

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const recent: OutboundEmail[] = [];

/** Test/dev introspection: the most recent message to an address. */
export function lastSentEmail(to?: string): OutboundEmail | null {
  const list = to ? recent.filter((m) => m.to === to) : recent;
  return list.length > 0 ? list[list.length - 1] : null;
}

export function clearSentEmails(): void {
  recent.length = 0;
}

export async function sendEmail(message: OutboundEmail): Promise<void> {
  recent.push(message);
  if (recent.length > 50) recent.shift();

  const result = await deliver(message);
  if (result.delivered) return;

  if (result.reason === "failed") {
    // Surfaced rather than swallowed: a lifecycle run that cannot deliver
    // should fail visibly, not quietly mark the message as sent.
    throw new Error(`Email delivery failed: ${result.detail ?? "unknown"}`);
  }
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[email] to=${message.to} subject=${JSON.stringify(message.subject)}\n${message.text}`,
    );
  }
}
