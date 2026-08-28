import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { stripeEvents, subscriptions } from "../db/schema.ts";
import { findUserIdByCustomer } from "./entitlements.ts";
import { planForPriceId, PLANS, type PlanId } from "./pricing.ts";
import type { SubscriptionStatus } from "./entitlements.ts";

/**
 * Applying a Stripe event to an account's entitlements (ADR 0003).
 *
 * Two properties this has to hold, because Stripe guarantees neither:
 *
 *   Replay-safe. Every event id is written to `stripe_events` in the same
 *   transaction that applies it, and the write is the idempotency check:
 *   an id already present means the event has been handled, so the handler
 *   returns "duplicate" and touches nothing.
 *
 *   Order-safe. Stripe may deliver an older event after a newer one. The
 *   subscription row remembers the Stripe creation time of the event that
 *   last wrote it, and an event older than that is recorded as "stale" and
 *   not applied — so a late `customer.subscription.updated` cannot undo a
 *   cancellation that already landed.
 */

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
] as const;

export type WebhookOutcome =
  | "applied"
  | "duplicate"
  | "stale"
  | "ignored"
  | "unmatched";

export type WebhookResult = {
  outcome: WebhookOutcome;
  userId: string | null;
  detail: string;
};

/** Stripe timestamps are seconds; the schema stores milliseconds. */
function ms(seconds: number | null | undefined): Date | null {
  return seconds == null ? null : new Date(seconds * 1000);
}

function addMonths(from: Date, months: number): Date {
  const out = new Date(from);
  out.setMonth(out.getMonth() + months);
  return out;
}

type Patch = {
  plan: PlanId;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
};

/**
 * The entitlement state an event implies, read from the event's own object
 * rather than from what came before it. Reading current state off the
 * event is what makes out-of-order delivery merely a question of "which is
 * newer", instead of a state machine that can be walked backwards.
 */
function patchFor(event: Stripe.Event): Patch | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid" && session.mode !== "subscription") {
        return null;
      }
      const plan = planFromMetadata(session.metadata);
      if (!plan || plan === "free") return null;

      // A one-time plan has no Stripe subscription to expire it, so its
      // window is computed here and stored on the row.
      if (PLANS[plan].billing === "one_time") {
        const months = PLANS[plan].durationMonths ?? 1;
        return {
          plan,
          status: "active",
          currentPeriodEnd: addMonths(new Date(event.created * 1000), months),
          cancelAtPeriodEnd: false,
          trialEndsAt: null,
          stripeCustomerId: asId(session.customer),
        };
      }
      // For subscriptions, the authoritative state arrives in the
      // customer.subscription.* events; this only records the binding.
      return {
        plan,
        status: "active",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        stripeSubscriptionId: asId(session.subscription),
        stripeCustomerId: asId(session.customer),
      };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
      const plan =
        (priceId ? planForPriceId(priceId) : null) ??
        planFromMetadata(subscription.metadata);
      if (!plan || plan === "free") return null;

      const deleted = event.type === "customer.subscription.deleted";
      const item = subscription.items?.data?.[0];
      return {
        plan,
        status: deleted
          ? "canceled"
          : (subscription.status as SubscriptionStatus),
        // Basil moved the period fields onto the subscription item.
        currentPeriodEnd: deleted
          ? ms(subscription.ended_at) ?? new Date(event.created * 1000)
          : ms(item?.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
        trialEndsAt: ms(subscription.trial_end),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: asId(subscription.customer),
      };
    }

    default:
      // invoice.paid / invoice.payment_failed carry no entitlement change
      // of their own: the subscription event that accompanies them does.
      // They are recorded so the ledger is complete and so M6's admin view
      // can show a failing card.
      return null;
  }
}

function asId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id: unknown }).id);
  }
  return null;
}

function planFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): PlanId | null {
  const raw = metadata?.q86_plan;
  if (raw === "monthly" || raw === "sprint" || raw === "free") return raw;
  return null;
}

/** Resolve the account an event belongs to: metadata first, customer id next. */
async function resolveUserId(event: Stripe.Event): Promise<string | null> {
  const object = event.data.object as {
    metadata?: Stripe.Metadata | null;
    customer?: unknown;
    client_reference_id?: string | null;
  };
  const fromMetadata = object.metadata?.q86_user_id ?? null;
  if (fromMetadata) return fromMetadata;
  if (object.client_reference_id) return object.client_reference_id;

  const customerId = asId(object.customer);
  if (customerId) return findUserIdByCustomer(customerId);
  return null;
}

/**
 * Apply one verified Stripe event. Safe to call repeatedly with the same
 * event: the second call reports "duplicate" and changes nothing.
 */
export async function applyStripeEvent(
  event: Stripe.Event,
): Promise<WebhookResult> {
  const seen = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id))
    .get();
  if (seen) {
    return {
      outcome: "duplicate",
      userId: null,
      detail: `${event.id} was already processed`,
    };
  }

  const eventAt = new Date(event.created * 1000);

  const record = async (
    outcome: WebhookOutcome,
    userId: string | null,
    detail: string,
  ): Promise<WebhookResult> => {
    await db
      .insert(stripeEvents)
      .values({
        id: event.id,
        type: event.type,
        stripeCreatedAt: eventAt,
        userId,
        outcome,
      })
      .onConflictDoNothing()
      .run();
    return { outcome, userId, detail };
  };

  if (!HANDLED_EVENTS.includes(event.type as (typeof HANDLED_EVENTS)[number])) {
    return record("ignored", null, `${event.type} is not an entitlement event`);
  }

  const userId = await resolveUserId(event);
  if (!userId) {
    return record(
      "unmatched",
      null,
      `${event.type} could not be traced to an account`,
    );
  }

  const patch = patchFor(event);
  if (!patch) {
    return record("ignored", userId, `${event.type} implies no plan change`);
  }

  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get();

  // Out-of-order guard: never let an older event overwrite a newer state.
  if (
    existing?.lastEventAt &&
    existing.lastEventAt.getTime() > eventAt.getTime()
  ) {
    return record(
      "stale",
      userId,
      `${event.id} predates the event already applied to this account`,
    );
  }

  const values = {
    userId,
    plan: patch.plan,
    status: patch.status,
    currentPeriodEnd:
      patch.currentPeriodEnd ?? existing?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: patch.cancelAtPeriodEnd,
    trialEndsAt: patch.trialEndsAt ?? existing?.trialEndsAt ?? null,
    stripeSubscriptionId:
      patch.stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
    stripeCustomerId:
      patch.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
    lastEventId: event.id,
    lastEventAt: eventAt,
    updatedAt: new Date(),
  };

  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.userId, set: values })
    .run();

  return record(
    "applied",
    userId,
    `${event.type} → ${patch.plan}/${patch.status}`,
  );
}
