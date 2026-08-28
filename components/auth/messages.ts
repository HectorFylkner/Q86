/**
 * Server actions return codes, not sentences, so the wording lives in one
 * place and M3 can move it into the message catalog without touching a
 * single action. An unknown code falls back to a generic line rather than
 * rendering the code itself.
 */
export const AUTH_MESSAGES: Record<string, string> = {
  email_invalid: "Det där ser inte ut som en giltig e-postadress.",
  email_taken:
    "Det finns redan ett konto med den adressen. Logga in i stället.",
  password_too_short: "Lösenordet måste vara minst 10 tecken.",
  password_too_long: "Lösenordet är för långt (max 200 tecken).",
  credentials_invalid: "Fel e-postadress eller lösenord.",
  token_invalid:
    "Länken har gått ut eller är redan använd. Begär en ny återställning.",
  oauth_failed: "Google-inloggningen gick inte att slutföra. Försök igen.",
  oauth_state: "Inloggningen tog för lång tid. Försök igen.",
  oauth_unconfigured: "Google-inloggning är inte aktiverad på den här servern.",
};

export function authMessage(code: string | null): string | null {
  if (!code) return null;
  return AUTH_MESSAGES[code] ?? "Något gick fel. Försök igen.";
}
