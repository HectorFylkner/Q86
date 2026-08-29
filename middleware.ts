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

/**
 * Reachable without a session. Everything else redirects to /login.
 *
 * From M4 this list carries the public site as well as the credential
 * screens. `tests/unit/paywall-structure.test.ts` checks it against the
 * filesystem in both directions: a page under app/(marketing) that is
 * missing here would 302 to the login form, and an application page that
 * appeared here would be served to strangers.
 */
const PUBLIC_PREFIXES = [
  // The public site.
  "/priser",
  "/diagnos",
  "/guider",
  "/kort/",
  "/integritetspolicy",
  "/kopvillkor",
  "/angerratt",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  // Credential screens.
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/auth/",
  // Stripe authenticates itself with a webhook signature, not a cookie.
  "/api/billing/webhook",
];

function isPublic(pathname: string): boolean {
  // The landing page is public, but only exactly "/" — the application
  // lives at /idag, so this cannot be written as a prefix.
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) =>
      pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix),
  );
}

/**
 * A server component cannot see its own pathname, so the middleware puts
 * it on the request. The public site's aggregate counter reads it from
 * there (M6); nothing else depends on it.
 */
export const PATH_HEADER = "x-q86-path";

function withPath(request: NextRequest): NextResponse {
  const headers = new Headers(request.headers);
  headers.set(PATH_HEADER, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return withPath(request);
  if (request.cookies.get(SESSION_COOKIE)?.value) return withPath(request);

  // API routes get a 401 rather than an HTML redirect, so a fetch from the
  // client sees a status it can act on.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icons/|apple-touch-icon\\.png).*)",
  ],
};
