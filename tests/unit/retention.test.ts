import "../helpers/test-env.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessGrants, attempts, emailLog, subscriptions, users } from "@/lib/db/schema";
import { createUser } from "@/lib/auth/users";
import { resolveEntitlements } from "@/lib/billing/entitlements";
import {
  activeGrant,
  addGrant,
  payReferral,
  referralCodeFor,
  referralCount,
  REFERRAL_DAYS,
  userByReferralCode,
} from "@/lib/retention/grants";
import {
  cardFor,
  cardForCode,
  currentShareCode,
  revokeShareCode,
  shareCodeFor,
} from "@/lib/retention/share";
import {
  ENDING_SOON_DAYS,
  isoWeek,
  runLifecycleEmails,
  STREAK_FLOOR,
} from "@/lib/retention/lifecycle";
import { attemptStreak, weekSummary } from "@/lib/retention/activity";
import { clearSentEmails, lastSentEmail } from "@/lib/email/send";
import { migrateTestDb, seedQuestions } from "../helpers/db";

/**
 * Retention: the parts where a mistake is expensive rather than untidy.
 * Paying a referral twice costs money, sending the same weekly digest
 * twice costs trust, and a progress card that leaks an email address
 * costs both.
 *
 * `migrateTestDb` migrates rather than truncates, so accounts made by an
 * earlier test in this file are still there when a later one runs the
 * dispatcher. Every assertion about mail therefore filters by address
 * instead of counting the whole sweep — which is also closer to what the
 * dispatcher does in production, where it always has other accounts to
 * walk past.
 */

/** What one address received in a sweep. */
function forAddress(
  sent: Array<{ kind: string; to: string }>,
  to: string,
): string[] {
  return sent.filter((d) => d.to === to).map((d) => d.kind);
}

const DAY = 86_400_000;
let questionIds: number[] = [];

beforeEach(async () => {
  await migrateTestDb();
  questionIds = await seedQuestions();
  clearSentEmails();
});

async function account(email: string) {
  return createUser({ email, password: "provlosenord-2026" });
}

async function recordAttempt(
  userId: string,
  when: Date,
  correct = true,
): Promise<void> {
  await db.insert(attempts).values({
    userId,
    questionId: questionIds[0],
    mode: "drill",
    focus: "focused",
    selectedIndex: 0,
    correct,
    timeSeconds: 60,
    confidence: "lock",
    createdAt: when,
  });
}

describe("referral codes", () => {
  it("mints once and returns the same code afterwards", async () => {
    const user = await account("a@exempel.se");
    const first = await referralCodeFor(user.id);
    const second = await referralCodeFor(user.id);
    expect(second).toBe(first);
    expect(first).toMatch(/^[2-9BCDFGHJKLMNPQRSTVWXYZ]{7}$/);
  });

  it("is not minted just because an account exists", async () => {
    const user = await account("b@exempel.se");
    const row = await db
      .select({ code: users.referralCode })
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    expect(row?.code).toBeNull();
  });

  it("resolves case-insensitively and ignores surrounding space", async () => {
    const user = await account("c@exempel.se");
    const code = await referralCodeFor(user.id);
    expect((await userByReferralCode(`  ${code.toLowerCase()} `))?.id).toBe(
      user.id,
    );
    expect(await userByReferralCode("NOTACODE")).toBeNull();
    expect(await userByReferralCode("")).toBeNull();
  });
});

describe("referral payouts", () => {
  it("gives both sides the same number of days", async () => {
    const inviter = await account("inbjudare@exempel.se");
    const invitee = await account("inbjuden@exempel.se");
    const now = new Date();
    await payReferral(inviter.id, invitee.id, now);

    for (const id of [inviter.id, invitee.id]) {
      const grant = await activeGrant(id, now);
      expect(grant?.days).toBe(REFERRAL_DAYS);
      expect(grant!.expiresAt.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it("cannot pay the same pair twice, however many times it retries", async () => {
    const inviter = await account("i2@exempel.se");
    const invitee = await account("j2@exempel.se");
    await payReferral(inviter.id, invitee.id);
    await payReferral(inviter.id, invitee.id);
    await payReferral(inviter.id, invitee.id);

    const rows = await db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.userId, inviter.id))
      .all();
    expect(rows).toHaveLength(1);
    expect(await referralCount(inviter.id)).toBe(1);
  });

  it("refuses a self-referral", async () => {
    const user = await account("sjalv@exempel.se");
    const result = await payReferral(user.id, user.id);
    expect(result).toEqual({ inviter: null, invitee: null });
    expect(await activeGrant(user.id)).toBeNull();
  });

  it("stacks a second grant onto the end of the first", async () => {
    const user = await account("staplare@exempel.se");
    const now = new Date();
    const first = await addGrant({
      userId: user.id,
      reason: "referral_inviter",
      days: REFERRAL_DAYS,
      sourceUserId: "usr_one",
      now,
    });
    const second = await addGrant({
      userId: user.id,
      reason: "referral_inviter",
      days: REFERRAL_DAYS,
      sourceUserId: "usr_two",
      now,
    });
    // The second starts where the first ends, so nothing is swallowed.
    expect(second!.expiresAt.getTime()).toBeCloseTo(
      first!.expiresAt.getTime() + REFERRAL_DAYS * DAY,
      -3,
    );
  });
});

describe("grants and the paywall", () => {
  it("unlocks paid features through the same entitlement function", async () => {
    const user = await account("gast@exempel.se");
    const before = await resolveEntitlements(user.id);
    expect(before.paid).toBe(false);
    expect(before.features.has("timed")).toBe(false);

    await addGrant({
      userId: user.id,
      reason: "referral_invitee",
      days: 14,
      sourceUserId: "usr_x",
    });

    const after = await resolveEntitlements(user.id);
    expect(after.paid).toBe(true);
    expect(after.features.has("timed")).toBe(true);
    expect(after.grantedUntil).not.toBeNull();
    // The stored plan is still free: a grant is not a purchase, and the
    // account page must be able to say so.
    expect(after.plan).toBe("free");
  });

  it("stops granting the moment it expires", async () => {
    const user = await account("utgangen@exempel.se");
    const past = new Date(Date.now() - 30 * DAY);
    await addGrant({
      userId: user.id,
      reason: "goodwill",
      days: 1,
      now: past,
    });
    const now = await resolveEntitlements(user.id);
    expect(now.paid).toBe(false);
    expect(now.grantedUntil).toBeNull();
  });

  it("lets a purchase outrank a grant", async () => {
    const user = await account("kopare@exempel.se");
    await db.insert(subscriptions).values({
      userId: user.id,
      plan: "sprint",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 60 * DAY),
    });
    await addGrant({
      userId: user.id,
      reason: "referral_inviter",
      days: 14,
      sourceUserId: "usr_y",
    });
    const entitlements = await resolveEntitlements(user.id);
    expect(entitlements.effectivePlan).toBe("sprint");
    expect(entitlements.paid).toBe(true);
  });
});

describe("the progress card", () => {
  it("contains totals and nothing that identifies a person", async () => {
    const user = await account("delare@exempel.se");
    await recordAttempt(user.id, new Date(), true);
    await recordAttempt(user.id, new Date(), false);

    const card = await cardFor(user.id);
    expect(card.attempts).toBe(2);
    expect(card.correct).toBe(1);
    expect(card.accuracy).toBeCloseTo(0.5, 5);
    // The whole payload, serialised, is what a page could render.
    const serialised = JSON.stringify(card);
    expect(serialised).not.toContain("delare@exempel.se");
    expect(serialised).not.toContain(user.id);
    expect(Object.keys(card).sort()).toEqual([
      "accuracy",
      "attempts",
      "chapters",
      "correct",
      "daysToTest",
      "streak",
    ]);
  });

  it("resolves by share code, and revoking breaks every old link", async () => {
    const user = await account("kort@exempel.se");
    await recordAttempt(user.id, new Date());
    const code = await shareCodeFor(user.id);
    expect(await cardForCode(code)).not.toBeNull();

    await revokeShareCode(user.id);
    expect(await currentShareCode(user.id)).toBeNull();
    expect(await cardForCode(code)).toBeNull();

    // A new code is a different link; the old one stays dead.
    const next = await shareCodeFor(user.id);
    expect(next).not.toBe(code);
    expect(await cardForCode(code)).toBeNull();
    expect(await cardForCode(next)).not.toBeNull();
  });

  it("returns nothing for an unknown or empty code", async () => {
    expect(await cardForCode("obefintlig")).toBeNull();
    expect(await cardForCode("   ")).toBeNull();
  });
});

describe("activity", () => {
  it("counts a streak of consecutive days ending on a given day", async () => {
    const user = await account("svit@exempel.se");
    const now = new Date();
    for (const back of [0, 1, 2]) {
      await recordAttempt(user.id, new Date(now.getTime() - back * DAY));
    }
    expect(await attemptStreak(user.id, now)).toBe(3);
    // A gap stops the count rather than being skipped over.
    await recordAttempt(user.id, new Date(now.getTime() - 5 * DAY));
    expect(await attemptStreak(user.id, now)).toBe(3);
  });

  it("summarises a week without counting casual attempts", async () => {
    const user = await account("vecka@exempel.se");
    const now = new Date();
    await recordAttempt(user.id, now, true);
    await recordAttempt(user.id, new Date(now.getTime() - 2 * DAY), false);
    await db.insert(attempts).values({
      userId: user.id,
      questionId: questionIds[0],
      mode: "drill",
      focus: "casual",
      selectedIndex: 0,
      correct: true,
      timeSeconds: 10,
      confidence: "guess",
      createdAt: now,
    });

    const summary = await weekSummary(user.id, now);
    expect(summary.attempts).toBe(2);
    expect(summary.correct).toBe(1);
    expect(summary.days).toBe(2);
  });
});

describe("lifecycle mail", () => {
  it("welcomes a new account exactly once", async () => {
    const user = await account("ny@exempel.se");
    const first = await runLifecycleEmails();
    expect(forAddress(first, "ny@exempel.se")).toContain("welcome");
    expect(lastSentEmail("ny@exempel.se")?.subject).toContain("Välkommen");

    const second = await runLifecycleEmails();
    expect(forAddress(second, "ny@exempel.se")).not.toContain("welcome");
    const rows = await db
      .select()
      .from(emailLog)
      .where(eq(emailLog.userId, user.id))
      .all();
    expect(rows.filter((r) => r.kind === "welcome")).toHaveLength(1);
  });

  it("sends the weekly digest once per ISO week, and not at all for an empty week", async () => {
    const user = await account("digest@exempel.se");
    const quiet = await runLifecycleEmails();
    expect(forAddress(quiet, "digest@exempel.se")).not.toContain("weekly");

    await recordAttempt(user.id, new Date());
    const first = await runLifecycleEmails();
    expect(forAddress(first, "digest@exempel.se")).toContain("weekly");

    const again = await runLifecycleEmails();
    expect(forAddress(again, "digest@exempel.se")).not.toContain("weekly");
  });

  it("warns before a fixed window closes, but not about a renewing plan", async () => {
    const closing = await account("slut@exempel.se");
    await db.insert(subscriptions).values({
      userId: closing.id,
      plan: "sprint",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + (ENDING_SOON_DAYS - 1) * DAY),
    });
    const renewing = await account("fortsatter@exempel.se");
    await db.insert(subscriptions).values({
      userId: renewing.id,
      plan: "monthly",
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(Date.now() + (ENDING_SOON_DAYS - 1) * DAY),
    });

    const sent = await runLifecycleEmails();
    const warned = sent
      .filter((d) => d.kind === "ending_soon")
      .map((d) => d.to);
    expect(warned).toContain("slut@exempel.se");
    expect(warned).not.toContain("fortsatter@exempel.se");
  });

  it("mourns a broken streak only when there was one to break", async () => {
    const now = new Date();
    const long = await account("langsvit@exempel.se");
    for (let back = 2; back < 2 + STREAK_FLOOR; back++) {
      await recordAttempt(long.id, new Date(now.getTime() - back * DAY));
    }
    const short = await account("kortsvit@exempel.se");
    await recordAttempt(short.id, new Date(now.getTime() - 2 * DAY));

    const sent = await runLifecycleEmails(now);
    const mourned = sent
      .filter((d) => d.kind === "streak_recovery")
      .map((d) => d.to);
    expect(mourned).toContain("langsvit@exempel.se");
    expect(mourned).not.toContain("kortsvit@exempel.se");
  });

  it("leaves alone someone who trained today", async () => {
    const now = new Date();
    const user = await account("aktiv@exempel.se");
    for (let back = 0; back < 5; back++) {
      await recordAttempt(user.id, new Date(now.getTime() - back * DAY));
    }
    const sent = await runLifecycleEmails(now);
    expect(forAddress(sent, "aktiv@exempel.se")).not.toContain(
      "streak_recovery",
    );
  });

  it("labels each ISO week distinctly, including across a year boundary", () => {
    expect(isoWeek(new Date("2026-01-01T12:00:00Z"))).toBe("2026-W01");
    expect(isoWeek(new Date("2026-01-04T12:00:00Z"))).toBe("2026-W01");
    expect(isoWeek(new Date("2026-01-05T12:00:00Z"))).toBe("2026-W02");
    expect(isoWeek(new Date("2026-12-31T12:00:00Z"))).toBe("2026-W53");
  });

  it("writes Swedish for a Swedish account and English for an English one", async () => {
    await createUser({
      email: "sv@exempel.se",
      password: "provlosenord-2026",
      locale: "sv",
    });
    await createUser({
      email: "en@exempel.se",
      password: "provlosenord-2026",
      locale: "en",
    });
    await runLifecycleEmails();
    expect(lastSentEmail("sv@exempel.se")?.subject).toContain("Välkommen");
    expect(lastSentEmail("en@exempel.se")?.subject).toContain("Welcome");
  });
});
