import { NextResponse, type NextRequest } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/auth/session";
import {
  exchangeCode,
  googleConfigured,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/auth/google";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleSubject,
  linkGoogleAccount,
  markEmailVerified,
} from "@/lib/auth/users";
import { ensureDbReady } from "@/lib/db/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(request: NextRequest, code: string): NextResponse {
  const response = NextResponse.redirect(
    new URL(`/login?error=${code}`, request.url),
  );
  for (const name of [OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}

export async function GET(request: NextRequest) {
  if (!googleConfigured()) return fail(request, "oauth_unconfigured");
  await ensureDbReady();

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  // A missing or mismatched state is a CSRF attempt or an expired attempt;
  // either way the only safe response is to start over.
  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return fail(request, "oauth_state");
  }

  let identity;
  try {
    identity = await exchangeCode({ code, origin: url.origin, verifier });
  } catch {
    return fail(request, "oauth_failed");
  }

  // Google is the only provider, so an unverified Google address must not
  // be allowed to claim an existing password account by email match.
  let user = await findUserByGoogleSubject(identity.subject);
  if (!user) {
    const byEmail = identity.emailVerified
      ? await findUserByEmail(identity.email)
      : null;
    if (byEmail) {
      user = byEmail;
      if (!byEmail.emailVerifiedAt) await markEmailVerified(byEmail.id);
    } else if (identity.emailVerified) {
      user = await createUser({
        email: identity.email,
        name: identity.name,
        emailVerified: true,
      });
    } else {
      return fail(request, "oauth_failed");
    }
    await linkGoogleAccount(user.id, identity.subject);
  }

  const returnTo = request.cookies.get(OAUTH_RETURN_COOKIE)?.value;
  const destination =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";

  const token = await createSession(user.id);
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 400 * 24 * 60 * 60,
  });
  for (const name of [
    OAUTH_STATE_COOKIE,
    OAUTH_VERIFIER_COOKIE,
    OAUTH_RETURN_COOKIE,
  ]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}
