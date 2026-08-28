import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "../db/index.ts";
import { ScopedDb } from "../db/scoped.ts";
import { authSessions, users, type User } from "../db/schema.ts";
import { digest, newToken } from "./tokens.ts";

/**
 * Session lifecycle (ADR 0002). The cookie carries a random token; the
 * database stores only its SHA-256 digest and the authoritative expiry.
 * The cookie's own max-age is deliberately long — the row decides when a
 * session ends, so a session can slide forward without needing to write a
 * cookie from a server component, which Next.js does not allow.
 */

export const SESSION_COOKIE = "q86_session";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Slide the expiry forward when a session is used inside its last week. */
const SLIDE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
/** Browsers cap persistent cookies at 400 days; the row is authoritative. */
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export type SessionUser = Pick<
  User,
  "id" | "email" | "name" | "locale" | "role" | "emailVerifiedAt" | "createdAt"
>;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

/** Creates the row and returns the raw token. Caller sets the cookie. */
export async function createSession(userId: string): Promise<string> {
  const raw = newToken();
  await db
    .insert(authSessions)
    .values({
      id: digest(raw),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .run();
  return raw;
}

/** Sign a user in. Only valid inside a server action or route handler. */
export async function startSession(userId: string): Promise<void> {
  const raw = await createSession(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, raw, cookieOptions());
}

/** Sign out: the row goes first, so a stolen cookie dies even if the
 *  clearing response is never delivered. */
export async function endSession(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    await db.delete(authSessions).where(eq(authSessions.id, digest(raw))).run();
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

/** Invalidate every session for a user (password change, account delete). */
export async function endAllSessions(userId: string): Promise<void> {
  await db.delete(authSessions).where(eq(authSessions.userId, userId)).run();
}

/** Resolve the signed-in user, or null. Safe in server components. */
export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return userForToken(raw);
}

/** Token → user, without touching cookies. Shared with the API routes and
 *  the tests, which carry the token themselves. */
export async function userForToken(
  raw: string,
): Promise<SessionUser | null> {
  const id = digest(raw);
  const row = await db
    .select({
      sessionId: authSessions.id,
      expiresAt: authSessions.expiresAt,
      id: users.id,
      email: users.email,
      name: users.name,
      locale: users.locale,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.id, id), gt(authSessions.expiresAt, new Date())))
    .get();
  if (!row) return null;

  if (row.expiresAt.getTime() - Date.now() < SLIDE_THRESHOLD_MS) {
    await db
      .update(authSessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
      .where(eq(authSessions.id, id))
      .run();
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    locale: row.locale,
    role: row.role,
    emailVerifiedAt: row.emailVerifiedAt,
    createdAt: row.createdAt,
  };
}

/** Thrown when an unauthenticated caller reaches protected work. Route
 *  code turns it into a redirect; API routes turn it into a 401. */
export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new NotAuthenticatedError();
  return user;
}

/**
 * The one call every server action and route handler makes before it
 * touches user data: it yields both the identity and the only accessor
 * that can reach that identity's rows.
 */
export async function requireScoped(): Promise<{
  user: SessionUser;
  sdb: ScopedDb;
}> {
  const user = await requireUser();
  return { user, sdb: new ScopedDb(user.id) };
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new NotAuthenticatedError();
  return user;
}

/** Housekeeping for the cron/admin surface. */
export async function pruneExpiredSessions(): Promise<number> {
  const removed = await db
    .delete(authSessions)
    .where(lt(authSessions.expiresAt, new Date()))
    .returning()
    .all();
  return removed.length;
}
