import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  authorizationUrl,
  googleConfigured,
  newVerifier,
  OAUTH_RETURN_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/auth/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Starts the Google authorization-code flow. State and PKCE verifier are
 *  parked in short-lived httpOnly cookies and checked on the way back. */
export async function GET(request: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_unconfigured", request.url),
    );
  }

  const state = randomBytes(16).toString("base64url");
  const verifier = newVerifier();
  const origin = new URL(request.url).origin;

  const response = NextResponse.redirect(
    authorizationUrl({ origin, state, verifier }),
  );
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, state, options);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, options);

  const next = request.nextUrl.searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    response.cookies.set(OAUTH_RETURN_COOKIE, next, options);
  }
  return response;
}
