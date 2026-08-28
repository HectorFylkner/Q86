import { and, eq, gte, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireScoped, type SessionUser } from "../auth/session.ts";
import { db } from "../db/index.ts";
import { ScopedDb } from "../db/scoped.ts";
import { attempts, subscriptions } from "../db/schema.ts";
import {
  PLANS,
  type Feature,
  type PlanId,
} from "./pricing.ts";

/**
 * The one place that decides what an account may do (ADR 0003).
 *
 * A page cannot forget the paywall because a page does not decide the
 * paywall: it calls `requireFeature()` and is redirected if the answer is
 * no. `tests/unit/paywall-structure.test.ts` asserts that every route
 * either gates itself this way or is on an explicit free list.
 */

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "expired";

export type Entitlements = {
  /** What the account bought. */
  plan: PlanId;
  /** What the account may currently use — `free` when a plan has lapsed. */
  effectivePlan: PlanId;
  status: SubscriptionStatus;
  /** True when a paid plan is in force right now. */
  paid: boolean;
  features: ReadonlySet<Feature>;
  /** Null when unlimited. */
  dailyQuestionLimit: number | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  /** True when Stripe is unhappy and the customer should update a card. */
  needsAttention: boolean;
};

const FREE: Omit<Entitlements, "features"> & { features: ReadonlySet<Feature> } = {
  plan: "free",
  effectivePlan: "free",
  status: "none",
  paid: false,
  features: new Set(PLANS.free.features),
  dailyQuestionLimit: PLANS.free.dailyQuestionLimit,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialEndsAt: null,
  needsAttention: false,
};

/** Statuses that grant access while the paid period is still running. */
const GRANTING: ReadonlySet<SubscriptionStatus> = new Set([
  "active",
  "trialing",
  // A cancelled subscription keeps access to the end of the period it was
  // already paid for; Stripe reports `canceled` from the moment it is set
  // to end, not from the moment access should stop.
  "canceled",
  // Stripe retries a failed payment for days. Cutting access on the first
  // failure punishes a customer whose card merely expired.
  "past_due",
]);

/** Statuses that should nag the customer to fix something. */
const ATTENTION: ReadonlySet<SubscriptionStatus> = new Set([
  "past_due",
  "unpaid",
  "incomplete",
]);

export async function resolveEntitlements(
  userId: string,
  now: Date = new Date(),
): Promise<Entitlements> {
  const row = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get();
  if (!row) return { ...FREE };

  const plan = row.plan;
  const status = row.status;
  const withinPeriod =
    row.currentPeriodEnd == null || row.currentPeriodEnd.getTime() > now.getTime();
  const paid = plan !== "free" && GRANTING.has(status) && withinPeriod;
  const effectivePlan: PlanId = paid ? plan : "free";

  return {
    plan,
    effectivePlan,
    status,
    paid,
    features: new Set(PLANS[effectivePlan].features),
    dailyQuestionLimit: PLANS[effectivePlan].dailyQuestionLimit,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    trialEndsAt: row.trialEndsAt,
    needsAttention: ATTENTION.has(status),
  };
}

export function allows(
  entitlements: Entitlements,
  feature: Feature,
): boolean {
  return entitlements.features.has(feature);
}

export type Gate = {
  user: SessionUser;
  sdb: ScopedDb;
  entitlements: Entitlements;
};

/**
 * Thrown when a server action is called for something the plan does not
 * include. Actions throw rather than redirect: they are invoked from
 * client code that needs to show a message in place, not be navigated.
 */
export class PaywallError extends Error {
  readonly feature: Feature;
  constructor(feature: Feature) {
    super(`paywall:${feature}`);
    this.name = "PaywallError";
    this.feature = feature;
  }
}

/** The action-side gate. Gating a page is not enough — every server action
 *  is a public endpoint that a client can call directly. */
export async function gateAction(feature: Feature): Promise<Gate> {
  const { user, sdb } = await requireScoped();
  const entitlements = await resolveEntitlements(user.id);
  if (!allows(entitlements, feature)) throw new PaywallError(feature);
  return { user, sdb, entitlements };
}

/** Thrown when a free account has spent its daily question allowance. */
export class DailyLimitError extends Error {
  readonly limit: number;
  constructor(limit: number) {
    super(`daily_limit:${limit}`);
    this.name = "DailyLimitError";
    this.limit = limit;
  }
}

/**
 * Authenticate, resolve entitlements, and stop here if the feature is not
 * included. The redirect target names the feature, so the account page can
 * say what was being reached for instead of a generic upsell.
 */
export async function requireFeature(feature: Feature): Promise<Gate> {
  const { user, sdb } = await requireScoped();
  const entitlements = await resolveEntitlements(user.id);
  if (!allows(entitlements, feature)) {
    redirect(`/konto?las=${encodeURIComponent(feature)}`);
  }
  return { user, sdb, entitlements };
}

/** Authenticate and resolve, without gating. For pages that show a mix. */
export async function withEntitlements(): Promise<Gate> {
  const { user, sdb } = await requireScoped();
  return { user, sdb, entitlements: await resolveEntitlements(user.id) };
}

// ---------------------------------------------------------------------------
// The free tier's daily allowance
// ---------------------------------------------------------------------------

/** Local midnight, so the allowance resets when the user's day does. */
function startOfLocalDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export type DailyAllowance = {
  limit: number | null;
  used: number;
  /** Null when unlimited. */
  remaining: number | null;
};

export async function dailyAllowance(
  sdb: ScopedDb,
  entitlements: Entitlements,
  now: Date = new Date(),
): Promise<DailyAllowance> {
  if (entitlements.dailyQuestionLimit == null) {
    return { limit: null, used: 0, remaining: null };
  }
  const since = startOfLocalDay(now);
  const today = await sdb.q
    .select({ id: attempts.id })
    .from(attempts)
    .where(sdb.own(attempts, gte(attempts.createdAt, since)))
    .all();
  const used = today.length;
  return {
    limit: entitlements.dailyQuestionLimit,
    used,
    remaining: Math.max(0, entitlements.dailyQuestionLimit - used),
  };
}

/** Whether a free account has any allowance left at all today. */
export async function hasAllowanceLeft(
  sdb: ScopedDb,
  entitlements: Entitlements,
  now: Date = new Date(),
): Promise<boolean> {
  const allowance = await dailyAllowance(sdb, entitlements, now);
  return allowance.remaining == null || allowance.remaining > 0;
}

// ---------------------------------------------------------------------------
// Writes (used by the webhook and the checkout return path only)
// ---------------------------------------------------------------------------

export async function findUserIdByCustomer(
  stripeCustomerId: string,
): Promise<string | null> {
  const row = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .get();
  return row?.userId ?? null;
}

/** Ensures a row exists so the customer id can be attached before checkout. */
export async function ensureSubscriptionRow(userId: string): Promise<void> {
  await db
    .insert(subscriptions)
    .values({ userId, plan: "free", status: "none" })
    .onConflictDoNothing()
    .run();
}

/**
 * Binds a Stripe customer to an account, once. The write is conditional on
 * the column still being null, so a second customer id can never silently
 * repoint an account's billing identity — which would hand one person's
 * subscription to another.
 */
export async function attachStripeCustomer(
  userId: string,
  stripeCustomerId: string,
): Promise<void> {
  await ensureSubscriptionRow(userId);
  await db
    .update(subscriptions)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(
      and(
        eq(subscriptions.userId, userId),
        isNull(subscriptions.stripeCustomerId),
      ),
    )
    .run();
}

export async function stripeCustomerFor(
  userId: string,
): Promise<string | null> {
  const row = await db
    .select({ id: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get();
  return row?.id ?? null;
}
