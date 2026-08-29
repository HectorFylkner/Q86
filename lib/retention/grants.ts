import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/index.ts";
import { accessGrants, users } from "../db/schema.ts";
import { randomBytes } from "node:crypto";
import { newToken } from "../auth/tokens.ts";
import { REFERRAL_DAYS, REFERRAL_PLAN } from "./terms.ts";

export { REFERRAL_DAYS, REFERRAL_PLAN };

/**
 * Access granted outside Stripe.
 *
 * Referral rewards and goodwill days are rows in `access_grants`, not
 * writes to `subscriptions`: a grant must never overwrite what Stripe
 * knows, and a webhook arriving later must never wipe a grant. The two
 * live side by side and `resolveEntitlements` reads both.
 *
 * The uniqueness of (user, reason, source) is enforced by an index rather
 * than by a check-then-insert, so two concurrent signups on the same
 * referral code cannot both pay out.
 */

export type Grant = typeof accessGrants.$inferSelect;

export function grantId(): string {
  return `grt_${newToken().slice(0, 24)}`;
}

/** The furthest-out unexpired grant for an account, or null. */
export async function activeGrant(
  userId: string,
  now: Date = new Date(),
): Promise<Grant | null> {
  return (
    (await db
      .select()
      .from(accessGrants)
      .where(
        and(eq(accessGrants.userId, userId), gt(accessGrants.expiresAt, now)),
      )
      .orderBy(desc(accessGrants.expiresAt))
      .get()) ?? null
  );
}

export async function listGrants(userId: string): Promise<Grant[]> {
  return db
    .select()
    .from(accessGrants)
    .where(eq(accessGrants.userId, userId))
    .orderBy(desc(accessGrants.createdAt))
    .all();
}

/**
 * Add days to an account. Stacking is deliberate: two referrals give
 * twenty-eight days, counted from whichever is later — the existing grant
 * or now — so a reward earned during an active grant is not swallowed.
 */
export async function addGrant(input: {
  userId: string;
  reason: Grant["reason"];
  days: number;
  sourceUserId?: string | null;
  note?: string;
  now?: Date;
}): Promise<Grant | null> {
  const now = input.now ?? new Date();
  const existing = await activeGrant(input.userId, now);
  const from =
    existing && existing.expiresAt.getTime() > now.getTime()
      ? existing.expiresAt
      : now;
  const expiresAt = new Date(from.getTime() + input.days * 86_400_000);

  const rows = await db
    .insert(accessGrants)
    .values({
      id: grantId(),
      userId: input.userId,
      reason: input.reason,
      plan: REFERRAL_PLAN,
      days: input.days,
      expiresAt,
      sourceUserId: input.sourceUserId ?? null,
      note: input.note ?? "",
    })
    // The pair index is the guard. A duplicate is not an error: it is a
    // retry of a payout that already happened.
    .onConflictDoNothing()
    .returning();
  return rows[0] ?? null;
}

/** A short, unambiguous code: no vowels (so it spells nothing), no 0/O or
 *  1/I, and uppercase, because it gets read aloud and typed by hand. */
const ALPHABET = "23456789BCDFGHJKLMNPQRSTVWXYZ";

function makeCode(length = 7): string {
  // `randomBytes` directly rather than `newToken()`, which returns
  // base64url: reading base64 as hex silently yields NaN indexes, and an
  // out-of-range index on a string is `undefined`, which stringifies into
  // the code rather than throwing.
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * The account's referral code, generated on first use.
 *
 * Not generated at signup: an account that never opens the referral card
 * never needs one, and an unissued code is one fewer thing to leak. The
 * update is conditional on the column still being null, so two concurrent
 * callers cannot each mint a code and have the second overwrite the first.
 */
export async function referralCodeFor(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const row = await db
      .select({ code: users.referralCode })
      .from(users)
      .where(eq(users.id, userId))
      .get();
    if (!row) throw new Error(`referralCodeFor: no account ${userId}`);
    if (row.code) return row.code;

    const claimed = await db
      .update(users)
      .set({ referralCode: makeCode(), updatedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.referralCode)))
      .returning({ code: users.referralCode })
      .catch(() => null); // A unique-index collision: try another code.
    if (claimed?.[0]?.code) return claimed[0].code;
  }
  throw new Error("referralCodeFor: could not allocate a code.");
}

export async function userByReferralCode(
  code: string,
): Promise<{ id: string } | null> {
  const cleaned = code.trim().toUpperCase();
  if (cleaned.length === 0) return null;
  return (
    (await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, cleaned))
      .get()) ?? null
  );
}

/**
 * Pay out both sides of a referral.
 *
 * Called once, from signup, after the new account exists. Self-referral is
 * refused: the code's owner and the new account must differ, or the scheme
 * pays people for making second accounts.
 */
export async function payReferral(
  inviterId: string,
  inviteeId: string,
  now: Date = new Date(),
): Promise<{ inviter: Grant | null; invitee: Grant | null }> {
  if (inviterId === inviteeId) return { inviter: null, invitee: null };
  const inviter = await addGrant({
    userId: inviterId,
    reason: "referral_inviter",
    days: REFERRAL_DAYS,
    sourceUserId: inviteeId,
    now,
  });
  const invitee = await addGrant({
    userId: inviteeId,
    reason: "referral_invitee",
    days: REFERRAL_DAYS,
    sourceUserId: inviterId,
    now,
  });
  return { inviter, invitee };
}

/** How many referrals have actually paid out, for the referral card. */
export async function referralCount(userId: string): Promise<number> {
  const rows = await db
    .select({ id: accessGrants.id })
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.userId, userId),
        eq(accessGrants.reason, "referral_inviter"),
      ),
    )
    .all();
  return rows.length;
}
