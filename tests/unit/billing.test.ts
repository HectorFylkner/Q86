import "../helpers/test-env.ts";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stripeEvents, subscriptions } from "@/lib/db/schema";
import { applyStripeEvent } from "@/lib/billing/webhook";
import {
  attachStripeCustomer,
  dailyAllowance,
  resolveEntitlements,
} from "@/lib/billing/entitlements";
import {
  formatPrice,
  monthlyEquivalentOre,
  PLANS,
  planForPriceId,
  vatBreakdown,
  VAT_RATE,
} from "@/lib/billing/pricing";
import * as actions from "@/lib/actions";
import { scopedFor } from "@/lib/db/scoped";
import {
  checkoutCompleted,
  invoicePaymentFailed,
  subscriptionEvent,
  unrelatedEvent,
} from "../helpers/stripe-events";
import {
  asUser,
  makeAccount,
  migrateTestDb,
  seedQuestions,
  type TestAccount,
} from "../helpers/db";

const MONTHLY_PRICE = "price_test_monthly";
const SPRINT_PRICE = "price_test_sprint";

describe("pricing", () => {
  it("keeps the documented defaults in one module", () => {
    expect(PLANS.free.priceOre).toBe(0);
    expect(PLANS.monthly.priceOre).toBe(24_900);
    expect(PLANS.sprint.priceOre).toBe(59_900);
    expect(PLANS.sprint.durationMonths).toBe(3);
  });

  it("splits VAT so net plus VAT is exactly the displayed price", () => {
    for (const plan of [PLANS.monthly, PLANS.sprint]) {
      const { grossOre, netOre, vatOre } = vatBreakdown(plan.priceOre);
      expect(netOre + vatOre).toBe(grossOre);
      expect(vatOre / netOre).toBeCloseTo(VAT_RATE, 3);
    }
    // 249 kr inclusive of 25% moms is 199,20 net and 49,80 VAT.
    expect(vatBreakdown(24_900)).toEqual({
      grossOre: 24_900,
      netOre: 19_920,
      vatOre: 4_980,
    });
  });

  it("formats prices as a Swedish reader expects", () => {
    expect(formatPrice(24_900).replace(/ /g, " ")).toBe("249 kr");
    expect(formatPrice(59_900).replace(/ /g, " ")).toBe("599 kr");
    expect(formatPrice(0).replace(/ /g, " ")).toBe("0 kr");
  });

  it("states the sprint's honest monthly equivalent", () => {
    expect(monthlyEquivalentOre(PLANS.sprint)).toBe(19_967);
    expect(monthlyEquivalentOre(PLANS.monthly)).toBe(24_900);
  });

  it("maps a Stripe price id back to a plan", () => {
    process.env.STRIPE_PRICE_MONTHLY = MONTHLY_PRICE;
    process.env.STRIPE_PRICE_SPRINT = SPRINT_PRICE;
    expect(planForPriceId(MONTHLY_PRICE)).toBe("monthly");
    expect(planForPriceId(SPRINT_PRICE)).toBe("sprint");
    expect(planForPriceId("price_unknown")).toBeNull();
  });

  it("gives the free tier fewer features than the paid ones", () => {
    expect(PLANS.free.features).not.toContain("timed");
    expect(PLANS.free.features).not.toContain("analytics");
    expect(PLANS.monthly.features).toContain("timed");
    expect(PLANS.sprint.features).toEqual(PLANS.monthly.features);
    // The chapters are the acquisition asset, so they are free.
    expect(PLANS.free.features).toContain("learn");
  });
});

describe("entitlements and the webhook", () => {
  let account: TestAccount;
  const customerId = "cus_test_primary";

  beforeAll(async () => {
    await migrateTestDb();
    await seedQuestions();
    process.env.STRIPE_PRICE_MONTHLY = MONTHLY_PRICE;
    process.env.STRIPE_PRICE_SPRINT = SPRINT_PRICE;
  });

  beforeEach(async () => {
    // A clean billing slate per test; accounts are cheap.
    await db.delete(stripeEvents).run();
    await db.delete(subscriptions).run();
    account = await makeAccount(
      `billing-${Math.random().toString(36).slice(2)}@exempel.se`,
    );
    await attachStripeCustomer(account.id, customerId);
  });

  it("starts every account on the free plan", async () => {
    const fresh = await makeAccount("brand-new@exempel.se");
    const entitlements = await resolveEntitlements(fresh.id);
    expect(entitlements.plan).toBe("free");
    expect(entitlements.paid).toBe(false);
    expect(entitlements.features.has("timed")).toBe(false);
    expect(entitlements.dailyQuestionLimit).toBe(
      PLANS.free.dailyQuestionLimit,
    );
  });

  it("upgrades on a completed subscription checkout", async () => {
    const now = new Date("2026-09-01T10:00:00Z");
    const periodEnd = new Date("2026-10-01T10:00:00Z");

    const first = await applyStripeEvent(
      checkoutCompleted({
        userId: account.id,
        plan: "monthly",
        customerId,
        subscriptionId: "sub_test_1",
        createdAt: now,
      }),
    );
    expect(first.outcome).toBe("applied");

    const second = await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.created",
        userId: account.id,
        customerId,
        subscriptionId: "sub_test_1",
        priceId: MONTHLY_PRICE,
        status: "active",
        periodEnd,
        createdAt: new Date(now.getTime() + 1000),
      }),
    );
    expect(second.outcome).toBe("applied");

    const entitlements = await resolveEntitlements(
      account.id,
      new Date("2026-09-15T00:00:00Z"),
    );
    expect(entitlements.plan).toBe("monthly");
    expect(entitlements.paid).toBe(true);
    expect(entitlements.features.has("timed")).toBe(true);
    expect(entitlements.features.has("analytics")).toBe(true);
    expect(entitlements.dailyQuestionLimit).toBeNull();
    expect(entitlements.currentPeriodEnd?.toISOString()).toBe(
      periodEnd.toISOString(),
    );
  });

  it("gives the sprint plan a three-month window with no subscription", async () => {
    const purchasedAt = new Date("2026-09-01T10:00:00Z");
    const result = await applyStripeEvent(
      checkoutCompleted({
        userId: account.id,
        plan: "sprint",
        customerId,
        createdAt: purchasedAt,
      }),
    );
    expect(result.outcome).toBe("applied");

    const during = await resolveEntitlements(
      account.id,
      new Date("2026-11-01T00:00:00Z"),
    );
    expect(during.plan).toBe("sprint");
    expect(during.paid).toBe(true);

    // It ends by itself: nothing renews, and nothing has to cancel it.
    const after = await resolveEntitlements(
      account.id,
      new Date("2026-12-15T00:00:00Z"),
    );
    expect(after.plan).toBe("sprint");
    expect(after.paid).toBe(false);
    expect(after.effectivePlan).toBe("free");
    expect(after.features.has("timed")).toBe(false);
  });

  it("downgrades when the subscription is deleted", async () => {
    const now = new Date("2026-09-01T10:00:00Z");
    await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.created",
        userId: account.id,
        customerId,
        subscriptionId: "sub_test_2",
        priceId: MONTHLY_PRICE,
        status: "active",
        periodEnd: new Date("2026-10-01T10:00:00Z"),
        createdAt: now,
      }),
    );
    expect((await resolveEntitlements(account.id, now)).paid).toBe(true);

    const endedAt = new Date("2026-09-20T10:00:00Z");
    const deletion = await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.deleted",
        userId: account.id,
        customerId,
        subscriptionId: "sub_test_2",
        priceId: MONTHLY_PRICE,
        status: "canceled",
        periodEnd: endedAt,
        endedAt,
        createdAt: endedAt,
      }),
    );
    expect(deletion.outcome).toBe("applied");

    const after = await resolveEntitlements(
      account.id,
      new Date("2026-09-21T00:00:00Z"),
    );
    expect(after.status).toBe("canceled");
    expect(after.paid).toBe(false);
    expect(after.features.has("timed")).toBe(false);
  });

  it("keeps access until the period ends when a customer cancels early", async () => {
    const now = new Date("2026-09-05T10:00:00Z");
    const periodEnd = new Date("2026-10-01T10:00:00Z");
    await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.updated",
        userId: account.id,
        customerId,
        subscriptionId: "sub_test_3",
        priceId: MONTHLY_PRICE,
        status: "canceled",
        periodEnd,
        cancelAtPeriodEnd: true,
        createdAt: now,
      }),
    );

    // Cancelled, but paid for until October.
    const mid = await resolveEntitlements(
      account.id,
      new Date("2026-09-20T00:00:00Z"),
    );
    expect(mid.cancelAtPeriodEnd).toBe(true);
    expect(mid.paid).toBe(true);

    const after = await resolveEntitlements(
      account.id,
      new Date("2026-10-02T00:00:00Z"),
    );
    expect(after.paid).toBe(false);
  });

  it("keeps access through a failed payment, but flags it", async () => {
    const now = new Date("2026-09-01T10:00:00Z");
    await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.updated",
        userId: account.id,
        customerId,
        subscriptionId: "sub_test_4",
        priceId: MONTHLY_PRICE,
        status: "past_due",
        periodEnd: new Date("2026-10-01T10:00:00Z"),
        createdAt: now,
      }),
    );
    const entitlements = await resolveEntitlements(account.id, now);
    expect(entitlements.paid).toBe(true);
    expect(entitlements.needsAttention).toBe(true);
  });

  // -------------------------------------------------------------------
  // Delivery hazards
  // -------------------------------------------------------------------

  it("changes nothing when an event is replayed", async () => {
    const now = new Date("2026-09-01T10:00:00Z");
    const event = subscriptionEvent({
      type: "customer.subscription.created",
      userId: account.id,
      customerId,
      subscriptionId: "sub_replay",
      priceId: MONTHLY_PRICE,
      status: "active",
      periodEnd: new Date("2026-10-01T10:00:00Z"),
      createdAt: now,
    });

    expect((await applyStripeEvent(event)).outcome).toBe("applied");
    const afterFirst = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, account.id))
      .get();

    for (let i = 0; i < 3; i++) {
      expect((await applyStripeEvent(event)).outcome).toBe("duplicate");
    }

    const afterReplays = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, account.id))
      .get();
    expect(afterReplays).toEqual(afterFirst);

    const ledger = await db.select().from(stripeEvents).all();
    expect(ledger.filter((e) => e.id === event.id)).toHaveLength(1);
  });

  it("refuses to let an older event undo a newer one", async () => {
    const cancelledAt = new Date("2026-09-20T10:00:00Z");
    const cancellation = subscriptionEvent({
      type: "customer.subscription.deleted",
      userId: account.id,
      customerId,
      subscriptionId: "sub_order",
      priceId: MONTHLY_PRICE,
      status: "canceled",
      periodEnd: cancelledAt,
      endedAt: cancelledAt,
      createdAt: cancelledAt,
    });
    // The renewal Stripe created BEFORE the cancellation, delivered after.
    const earlierRenewal = subscriptionEvent({
      type: "customer.subscription.updated",
      userId: account.id,
      customerId,
      subscriptionId: "sub_order",
      priceId: MONTHLY_PRICE,
      status: "active",
      periodEnd: new Date("2026-10-20T10:00:00Z"),
      createdAt: new Date("2026-09-10T10:00:00Z"),
    });

    expect((await applyStripeEvent(cancellation)).outcome).toBe("applied");
    const late = await applyStripeEvent(earlierRenewal);
    expect(late.outcome).toBe("stale");

    // The cancellation still stands.
    const entitlements = await resolveEntitlements(
      account.id,
      new Date("2026-09-25T00:00:00Z"),
    );
    expect(entitlements.status).toBe("canceled");
    expect(entitlements.paid).toBe(false);
  });

  it("records but does not act on events it does not handle", async () => {
    const result = await applyStripeEvent(
      unrelatedEvent(new Date("2026-09-01T10:00:00Z")),
    );
    expect(result.outcome).toBe("ignored");
    expect((await resolveEntitlements(account.id)).plan).toBe("free");

    const failed = await applyStripeEvent(
      invoicePaymentFailed({
        customerId,
        createdAt: new Date("2026-09-02T10:00:00Z"),
      }),
    );
    // Traced to the account, but carrying no entitlement change of its own.
    expect(failed.outcome).toBe("ignored");
    expect(failed.userId).toBe(account.id);
  });

  it("records an event it cannot trace to an account, without failing", async () => {
    const result = await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.created",
        userId: "",
        customerId: "cus_nobody_here",
        subscriptionId: "sub_orphan",
        priceId: MONTHLY_PRICE,
        status: "active",
        periodEnd: new Date("2026-10-01T10:00:00Z"),
        createdAt: new Date("2026-09-01T10:00:00Z"),
      }),
    );
    expect(result.outcome).toBe("unmatched");
    const ledger = await db.select().from(stripeEvents).all();
    expect(ledger.some((e) => e.outcome === "unmatched")).toBe(true);
  });

  it("never resolves one account's plan for another", async () => {
    const other = await makeAccount("granne@exempel.se");
    await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.created",
        userId: account.id,
        customerId,
        subscriptionId: "sub_isolated",
        priceId: MONTHLY_PRICE,
        status: "active",
        periodEnd: new Date(Date.now() + 30 * 86_400_000),
        createdAt: new Date(),
      }),
    );
    expect((await resolveEntitlements(account.id)).paid).toBe(true);
    // The neighbour bought nothing and gets nothing, despite a paid row
    // existing in the same table.
    const neighbour = await resolveEntitlements(other.id);
    expect(neighbour.paid).toBe(false);
    expect(neighbour.plan).toBe("free");
    expect(neighbour.features.has("timed")).toBe(false);
  });

  it("traces an event by customer id when metadata is absent", async () => {
    const event = subscriptionEvent({
      type: "customer.subscription.created",
      userId: account.id,
      customerId,
      subscriptionId: "sub_by_customer",
      priceId: MONTHLY_PRICE,
      status: "active",
      periodEnd: new Date("2026-10-01T10:00:00Z"),
      createdAt: new Date("2026-09-01T10:00:00Z"),
    });
    // Strip the metadata Q86 stamps, leaving only what Stripe itself sets.
    (event.data.object as { metadata: unknown }).metadata = {};
    const result = await applyStripeEvent(event);
    expect(result.outcome).toBe("applied");
    expect(result.userId).toBe(account.id);
  });
});

describe("the paywall in front of server actions", () => {
  let free: TestAccount;
  let paid: TestAccount;

  beforeAll(async () => {
    await migrateTestDb();
    await seedQuestions();
    process.env.STRIPE_PRICE_MONTHLY = MONTHLY_PRICE;

    free = await makeAccount("gratis@exempel.se");
    paid = await makeAccount("betalande@exempel.se");
    await attachStripeCustomer(paid.id, "cus_paid_account");
    await applyStripeEvent(
      subscriptionEvent({
        type: "customer.subscription.created",
        userId: paid.id,
        customerId: "cus_paid_account",
        subscriptionId: "sub_paid",
        priceId: MONTHLY_PRICE,
        status: "active",
        // Far enough out that the test is not time-sensitive.
        periodEnd: new Date(Date.now() + 365 * 86_400_000),
        createdAt: new Date(),
      }),
    );
  });

  it("refuses timed sets to a free account and allows them to a paid one", async () => {
    asUser(free);
    await expect(
      actions.startTimedSet({ kind: "mini", showTimer: true }),
    ).rejects.toThrow(/paywall:timed/);

    asUser(paid);
    const started = await actions.startTimedSet({
      kind: "mini",
      showTimer: true,
    });
    expect(started.error).toBeNull();
    expect(started.questions.length).toBe(7);
  });

  it("refuses the deck, the queue and score-report import to a free account", async () => {
    asUser(free);
    await expect(actions.gradeDeckCard(1, "good")).rejects.toThrow(
      /paywall:deck/,
    );
    await expect(actions.startRedoSession([1])).rejects.toThrow(
      /paywall:queue/,
    );
    await expect(
      actions.saveBaselineReport({ rawText: "x", parsed: {} as never }),
    ).rejects.toThrow(/paywall:import/);
  });

  it("never paywalls reporting a broken question", async () => {
    asUser(free);
    await expect(
      actions.flagQuestion({ questionId: 1, reason: "ambiguous" }),
    ).resolves.toBeUndefined();
  });

  it("caps a free account's questions per day and lets a paid one run", async () => {
    asUser(free);
    const limit = PLANS.free.dailyQuestionLimit as number;

    const drill = await actions.startDrill({
      filter: {},
      count: limit + 5,
      timing: "untimed",
    });
    // The request is clamped to the allowance rather than refused.
    expect(drill.questions.length).toBeLessThanOrEqual(limit);

    for (let i = 0; i < limit; i++) {
      await actions.logAttempt({
        sessionId: drill.sessionId,
        questionId: drill.questions[i % drill.questions.length].id,
        mode: "drill",
        selectedIndex: 0,
        timeSeconds: 30,
        confidence: "guess",
      });
    }

    const sdb = scopedFor(free.id);
    const used = await dailyAllowance(sdb, await resolveEntitlements(free.id));
    expect(used.used).toBe(limit);
    expect(used.remaining).toBe(0);

    // The limit holds even when the client replays the call directly.
    await expect(
      actions.logAttempt({
        sessionId: drill.sessionId,
        questionId: drill.questions[0].id,
        mode: "drill",
        selectedIndex: 0,
        timeSeconds: 30,
        confidence: "guess",
      }),
    ).rejects.toThrow(/daily_limit/);

    const blocked = await actions.startDrill({
      filter: {},
      count: 5,
      timing: "untimed",
    });
    expect(blocked.error).toMatch(/gräns/);

    // A paid account has no limit to hit.
    asUser(paid);
    const paidAllowance = await dailyAllowance(
      scopedFor(paid.id),
      await resolveEntitlements(paid.id),
    );
    expect(paidAllowance.limit).toBeNull();
    expect(paidAllowance.remaining).toBeNull();
  });
});
