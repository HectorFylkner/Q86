import type Stripe from "stripe";

/**
 * Stripe event fixtures in the shape the real API sends, so the webhook
 * handler is tested against the payloads it will actually receive rather
 * than against a convenient simplification. Only the fields the handler
 * reads are filled in; the rest is cast, as it would be ignored anyway.
 */

let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_test_${counter.toString().padStart(6, "0")}`;
}

/** Stripe timestamps are seconds since the epoch. */
export function secondsFrom(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function envelope(
  type: string,
  object: unknown,
  createdAt: Date,
  id?: string,
): Stripe.Event {
  return {
    id: id ?? nextId("evt"),
    object: "event",
    api_version: "2026-08-26.dahlia",
    created: secondsFrom(createdAt),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type,
    data: { object },
  } as unknown as Stripe.Event;
}

export function checkoutCompleted(input: {
  userId: string;
  plan: "monthly" | "sprint";
  customerId: string;
  subscriptionId?: string;
  createdAt: Date;
  eventId?: string;
}): Stripe.Event {
  return envelope(
    "checkout.session.completed",
    {
      id: nextId("cs"),
      object: "checkout.session",
      mode: input.plan === "monthly" ? "subscription" : "payment",
      payment_status: "paid",
      status: "complete",
      customer: input.customerId,
      client_reference_id: input.userId,
      subscription: input.subscriptionId ?? null,
      currency: "sek",
      metadata: { q86_user_id: input.userId, q86_plan: input.plan },
    },
    input.createdAt,
    input.eventId,
  );
}

export function subscriptionEvent(input: {
  type:
    | "customer.subscription.created"
    | "customer.subscription.updated"
    | "customer.subscription.deleted";
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  status: string;
  periodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
  eventId?: string;
}): Stripe.Event {
  return envelope(
    input.type,
    {
      id: input.subscriptionId,
      object: "subscription",
      customer: input.customerId,
      status: input.status,
      cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      trial_end: input.trialEnd ? secondsFrom(input.trialEnd) : null,
      ended_at: input.endedAt ? secondsFrom(input.endedAt) : null,
      metadata: { q86_user_id: input.userId },
      items: {
        object: "list",
        data: [
          {
            id: nextId("si"),
            object: "subscription_item",
            // Basil moved the period boundaries onto the item.
            current_period_end: secondsFrom(input.periodEnd),
            current_period_start: secondsFrom(input.createdAt),
            price: { id: input.priceId, object: "price", currency: "sek" },
          },
        ],
      },
    },
    input.createdAt,
    input.eventId,
  );
}

export function invoicePaymentFailed(input: {
  customerId: string;
  createdAt: Date;
}): Stripe.Event {
  return envelope(
    "invoice.payment_failed",
    {
      id: nextId("in"),
      object: "invoice",
      customer: input.customerId,
      metadata: {},
    },
    input.createdAt,
  );
}

/** An event type Q86 does not act on, used to check it is merely recorded. */
export function unrelatedEvent(createdAt: Date): Stripe.Event {
  return envelope(
    "customer.updated",
    { id: nextId("cus"), object: "customer", metadata: {} },
    createdAt,
  );
}
