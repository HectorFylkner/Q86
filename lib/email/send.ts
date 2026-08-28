/**
 * Outbound mail. M1 needs exactly one message (the password-reset link) and
 * has no sending domain yet, so delivery is a seam rather than a provider:
 * in development and test the message is written to the server log and
 * captured in `lastSentEmail()`, which is what the reset test asserts on.
 * M5 replaces `deliver()` with a real transport and adds the lifecycle
 * messages; nothing else in the codebase has to change.
 */

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
  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[email] to=${message.to} subject=${JSON.stringify(message.subject)}\n${message.text}`,
    );
  }
}
