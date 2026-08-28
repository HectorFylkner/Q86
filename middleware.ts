import { NextResponse, type NextRequest } from "next/server";

/**
 * A cheap redirect, not an authorization boundary (ADR 0002).
 *
 * Middleware runs on the Edge runtime and cannot reach the libSQL client,
 * so it can only see whether a session cookie is present — not whether it
 * is valid. The real check is `requireUser()` / `requireScoped()` inside
 * every server action, route handler and protected page; this exists so a
 * signed-out visitor gets the login screen instead of an error boundary.
 *
 * This replaced the shared instance password that guarded every route
 * before M1: there is no instance-wide password any more, because there is
 * no instance-wide user.
 */
const SESSION_COOKIE = "q86_session";

/** Reachable without a session. Everything else redirects to /login. */
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth/",
  // Stripe authenticates itself with a webhook signature, not a cookie.
  "/api/billing/webhook",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) =>
      pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  // API routes get a 401 rather than an HTML redirect, so a fetch from the
  // client sees a status it can act on.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search =
    pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icons/|apple-touch-icon\\.png).*)",
  ],
};
