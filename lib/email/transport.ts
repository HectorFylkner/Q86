import type { OutboundEmail } from "./send.ts";

/**
 * Delivery. One seam, two implementations, chosen by environment.
 *
 * Without `RESEND_API_KEY` the message is logged and kept in memory —
 * which is what every test and every development run does, and what makes
 * "no live sends from this build" a property of the configuration rather
 * than a promise. With a key, the same message goes over Resend's HTTP
 * API; there is no SDK, because one HTTP call does not need one.
 *
 * `EMAIL_FROM` must be a verified sender on the sending domain. If it is
 * missing while a key is set, delivery fails loudly rather than silently
 * sending from a default nobody controls.
 */

export type DeliveryResult =
  | { delivered: true; id: string | null }
  | { delivered: false; reason: "not_configured" | "failed"; detail?: string };

export function transportConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "Q86 <no-reply@localhost>";
}

export async function deliver(
  message: OutboundEmail,
): Promise<DeliveryResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { delivered: false, reason: "not_configured" };
  if (!process.env.EMAIL_FROM) {
    throw new Error(
      "RESEND_API_KEY is set but EMAIL_FROM is not. Refusing to send from " +
        "an address nobody has verified.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      reason: "failed",
      detail: `${response.status} ${await response.text().catch(() => "")}`.trim(),
    };
  }
  const body = (await response.json().catch(() => null)) as {
    id?: string;
  } | null;
  return { delivered: true, id: body?.id ?? null };
}
