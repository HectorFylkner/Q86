import { NextResponse } from "next/server";
import { applyStripeEvent } from "@/lib/billing/webhook";
import { stripeClient, stripeConfigured } from "@/lib/billing/stripe";
import { ensureDbReady } from "@/lib/db/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook endpoint.
 *
 * The signature check is the authentication: this route is deliberately
 * outside the session middleware, so nothing but a correctly signed
 * payload may reach the handler. The raw body is required — parsing it
 * first would break the signature.
 *
 * Every reachable outcome answers 200. A 4xx or 5xx makes Stripe retry,
 * and retrying will not help when an event is a duplicate, arrived out of
 * order, or names an account we do not have; only a genuine failure to
 * write should be retried.
 */
export async function POST(request: Request) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "billing_unconfigured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const raw = await request.text();
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(
      raw,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (e) {
    console.warn("[billing] rejected an unsigned or stale webhook", e);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  await ensureDbReady();

  try {
    const result = await applyStripeEvent(event);
    if (result.outcome !== "applied" && result.outcome !== "duplicate") {
      console.log(`[billing] ${result.outcome}: ${result.detail}`);
    }
    return NextResponse.json({ received: true, outcome: result.outcome });
  } catch (e) {
    // A real write failure: let Stripe retry.
    console.error("[billing] webhook handler failed", e);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }
}
