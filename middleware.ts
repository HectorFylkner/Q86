import { NextResponse, type NextRequest } from "next/server";

/**
 * Single-user password gate for hosted deployments. Active only when
 * SITE_PASSWORD is set (local use stays friction-free without it). The
 * cookie stores a SHA-256 digest of the password, so logging out of a
 * hosted instance means clearing the cookie or rotating the secret.
 */
const COOKIE = "q86_auth";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const presented = request.cookies.get(COOKIE)?.value;
  if (presented && presented === (await sha256Hex(password))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
