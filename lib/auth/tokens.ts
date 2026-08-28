import { createHash, randomBytes, randomUUID } from "node:crypto";

/**
 * Opaque credentials (ADR 0002). The raw token is handed to exactly one
 * party — a cookie or an email link — and only its SHA-256 digest is
 * stored, so a database dump contains nothing replayable.
 */

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newUserId(): string {
  return `usr_${randomUUID().replaceAll("-", "")}`;
}

/** Normalised form used for storage and for uniqueness. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmailShaped(email: string): boolean {
  const value = normaliseEmail(email);
  return value.length <= 254 && EMAIL_RE.test(value);
}
