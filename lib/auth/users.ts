import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/index.ts";
import {
  authAccounts,
  authTokens,
  users,
  type User,
} from "../db/schema.ts";
import { hashPassword } from "./password.ts";
import { digest, newToken, newUserId, normaliseEmail } from "./tokens.ts";

/**
 * Account records. This module and `session.ts` are the only places that
 * touch the identity tables; everything else in the application sees a
 * user id and reaches content through `ScopedDb` (ADR 0001).
 */

export type TokenKind = "password_reset" | "magic_link" | "email_verify";

const TOKEN_TTL_MS: Record<TokenKind, number> = {
  password_reset: 30 * 60 * 1000,
  magic_link: 15 * 60 * 1000,
  email_verify: 24 * 60 * 60 * 1000,
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const row = await db
    .select()
    .from(users)
    .where(eq(users.email, normaliseEmail(email)))
    .get();
  return row ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const row = await db.select().from(users).where(eq(users.id, id)).get();
  return row ?? null;
}

export async function createUser(input: {
  email: string;
  password?: string;
  name?: string | null;
  locale?: "sv" | "en";
  role?: "user" | "admin";
  emailVerified?: boolean;
}): Promise<User> {
  const now = new Date();
  return db
    .insert(users)
    .values({
      id: newUserId(),
      email: normaliseEmail(input.email),
      passwordHash: input.password ? await hashPassword(input.password) : null,
      name: input.name ?? null,
      locale: input.locale ?? "sv",
      role: input.role ?? "user",
      emailVerifiedAt: input.emailVerified ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export async function setPassword(
  userId: string,
  password: string,
): Promise<void> {
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

export async function setLocale(
  userId: string,
  locale: "sv" | "en",
): Promise<void> {
  await db
    .update(users)
    .set({ locale, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

export async function setName(
  userId: string,
  name: string | null,
): Promise<void> {
  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

export async function markEmailVerified(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

// ---------------------------------------------------------------------------
// Federated identities
// ---------------------------------------------------------------------------

export async function findUserByGoogleSubject(
  subject: string,
): Promise<User | null> {
  const link = await db
    .select()
    .from(authAccounts)
    .where(
      and(
        eq(authAccounts.provider, "google"),
        eq(authAccounts.providerAccountId, subject),
      ),
    )
    .get();
  if (!link) return null;
  return findUserById(link.userId);
}

export async function linkGoogleAccount(
  userId: string,
  subject: string,
): Promise<void> {
  await db
    .insert(authAccounts)
    .values({ provider: "google", providerAccountId: subject, userId })
    .onConflictDoNothing()
    .run();
}

// ---------------------------------------------------------------------------
// Single-use tokens (reset, magic link, verification)
// ---------------------------------------------------------------------------

/** Issues a token and returns the RAW value — the only time it exists. */
export async function issueToken(
  userId: string,
  kind: TokenKind,
): Promise<string> {
  const raw = newToken();
  await db
    .insert(authTokens)
    .values({
      id: digest(raw),
      userId,
      kind,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS[kind]),
    })
    .run();
  return raw;
}

/**
 * Consumes a token: valid, unexpired, unused, of the right kind. Marking
 * it used is conditional on it still being unused, so two concurrent
 * redemptions cannot both succeed.
 */
export async function consumeToken(
  raw: string,
  kind: TokenKind,
): Promise<User | null> {
  const id = digest(raw);
  const row = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.id, id),
        eq(authTokens.kind, kind),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .get();
  if (!row) return null;

  const claimed = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.id, id), isNull(authTokens.usedAt)))
    .returning()
    .all();
  if (claimed.length === 0) return null;

  return findUserById(row.userId);
}

/** Invalidate outstanding tokens of a kind — used after a password change
 *  so an old reset link in an inbox stops working. */
export async function revokeTokens(
  userId: string,
  kind: TokenKind,
): Promise<void> {
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.userId, userId),
        eq(authTokens.kind, kind),
        isNull(authTokens.usedAt),
      ),
    )
    .run();
}
