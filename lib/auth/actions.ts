"use server";

import { redirect } from "next/navigation";
import { sendEmail } from "../email/send.ts";
import { translator } from "../i18n/index.ts";
import { isLocale, DEFAULT_LOCALE } from "../i18n/types.ts";
import { getLocale } from "../i18n/locale.ts";
import { endAllSessions, endSession, startSession } from "./session.ts";
import { verifyPassword, passwordProblem } from "./password.ts";
import {
  consumeToken,
  createUser,
  findUserByEmail,
  issueToken,
  revokeTokens,
  setPassword,
} from "./users.ts";
import { isEmailShaped, normaliseEmail } from "./tokens.ts";

/**
 * The credential flows. Every one of them returns a machine-readable error
 * code rather than a sentence, so `lib/i18n` owns the wording and the same
 * action serves both locales (ADR 0004).
 */

export type AuthResult = { error: string | null };

const OK: AuthResult = { error: null };

/** Where a signed-in user lands. Kept here so every flow agrees. */
const AFTER_SIGN_IN = "/idag";

export async function signUpAction(
  _previous: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "").trim();

  if (!isEmailShaped(email)) return { error: "email_invalid" };
  const problem = passwordProblem(password);
  if (problem) return { error: `password_${problem}` };

  if (await findUserByEmail(email)) {
    // Deliberately explicit: an account either exists or it does not, and
    // that is discoverable from the login form anyway. Pretending
    // otherwise here would only strand a returning user on a form that
    // silently does nothing.
    return { error: "email_taken" };
  }

  const user = await createUser({
    email,
    password,
    name: name.length > 0 ? name : null,
    // Whatever language they filled this form in is the language they
    // want the product in; the toggle on the form set the cookie.
    locale: await getLocale(),
  });
  await startSession(user.id);
  redirect(AFTER_SIGN_IN);
}

export async function signInAction(
  _previous: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");

  const user = await findUserByEmail(email);
  const ok = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !ok) {
    // One message for both cases, so the form is not an account oracle.
    return { error: "credentials_invalid" };
  }
  await startSession(user.id);
  redirect(safeNext(next));
}

export async function signOutAction(): Promise<void> {
  await endSession();
  // The login form, not the landing page: someone who just signed out on a
  // shared machine wants the door shut, not a sales pitch.
  redirect("/login");
}

export async function requestPasswordResetAction(
  _previous: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  const email = String(form.get("email") ?? "");
  if (!isEmailShaped(email)) return { error: "email_invalid" };

  const user = await findUserByEmail(email);
  if (user) {
    const token = await issueToken(user.id, "password_reset");
    const link = `${baseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    // The account's own language, not the requesting browser's: a reset is
    // read in an inbox, possibly on another device.
    const t = translator(isLocale(user.locale) ? user.locale : DEFAULT_LOCALE);
    await sendEmail({
      to: normaliseEmail(email),
      subject: t("auth.resetEmail.subject"),
      text: t("auth.resetEmail.body", { link }),
    });
  }
  // Always the same answer, whether or not the address exists.
  return OK;
}

export async function resetPasswordAction(
  _previous: AuthResult,
  form: FormData,
): Promise<AuthResult> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");

  const problem = passwordProblem(password);
  if (problem) return { error: `password_${problem}` };

  const user = await consumeToken(token, "password_reset");
  if (!user) return { error: "token_invalid" };

  await setPassword(user.id, password);
  // A reset means "I lost control of this account": kill every session and
  // every other outstanding link before signing the user back in.
  await revokeTokens(user.id, "password_reset");
  await endAllSessions(user.id);
  await startSession(user.id);
  redirect(AFTER_SIGN_IN);
}

// ---------------------------------------------------------------------------

/** Only same-site paths survive, so `?next=` cannot become an open redirect. */
export async function safeNextPath(candidate: string): Promise<string> {
  return safeNext(candidate);
}

function safeNext(candidate: string): string {
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return AFTER_SIGN_IN;
  }
  return candidate;
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}
