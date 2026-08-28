import { createHash, randomBytes } from "node:crypto";

/**
 * Google sign-in over plain OIDC (ADR 0002): authorization code with PKCE,
 * spoken with fetch. No SDK, so nothing to keep in step with a provider's
 * release cycle, and the whole flow is auditable in one file.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export const OAUTH_STATE_COOKIE = "q86_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "q86_oauth_verifier";
export const OAUTH_RETURN_COOKIE = "q86_oauth_return";

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

/** The redirect URI must match what is registered in the Google project. */
export function redirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;
}

export function newVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function challengeFor(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function authorizationUrl(input: {
  origin: string;
  state: string;
  verifier: string;
}): string {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri(input.origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", challengeFor(input.verifier));
  url.searchParams.set("code_challenge_method", "S256");
  // Keeps the account chooser honest when several Google accounts exist.
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export type GoogleIdentity = {
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

/** Exchanges the code and reads the profile. Throws with a short message
 *  on any failure; the callback route turns that into a redirect. */
export async function exchangeCode(input: {
  code: string;
  origin: string;
  verifier: string;
}): Promise<GoogleIdentity> {
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri(input.origin),
      grant_type: "authorization_code",
      code_verifier: input.verifier,
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(`token_exchange_failed_${tokenResponse.status}`);
  }
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("token_exchange_no_access_token");

  const profileResponse = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) {
    throw new Error(`userinfo_failed_${profileResponse.status}`);
  }
  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  if (!profile.sub || !profile.email) throw new Error("userinfo_incomplete");

  return {
    subject: profile.sub,
    email: profile.email,
    emailVerified: profile.email_verified === true,
    name: profile.name ?? null,
  };
}
