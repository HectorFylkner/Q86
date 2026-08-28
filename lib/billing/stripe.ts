import Stripe from "stripe";

/**
 * The Stripe client and the deployment's payment configuration (ADR 0003).
 *
 * Nothing here reaches for a key at module scope: a deployment without
 * Stripe configured must still boot, serve the free tier, and run its
 * tests. `stripeClient()` throws only when someone actually tries to take
 * a payment.
 */

let cached: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** True when the configured key is a live key rather than a test key. */
export function stripeIsLive(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
}

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — checkout and the customer portal are " +
        "unavailable on this deployment.",
    );
  }
  cached ??= new Stripe(key, {
    // Pinned: an unpinned account default can change under us and reshape
    // the webhook payloads this code reads.
    apiVersion: "2026-08-26.dahlia",
    typescript: true,
    appInfo: { name: "Q86", url: "https://github.com/HectorFylkner/Q86" },
  });
  return cached;
}

/**
 * Payment methods offered at checkout.
 *
 * Card and Klarna are the baseline for a Swedish consumer. Swish is
 * one-time only — Stripe cannot use it for a recurring subscription — so
 * it is offered on the fixed-length sprint plan and never on the monthly
 * one. Enable it with STRIPE_ENABLE_SWISH=1 once the account exposes it;
 * an account without Swish would otherwise fail the session outright.
 */
export function paymentMethodTypes(
  mode: "subscription" | "payment",
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const methods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
    "card",
    "klarna",
  ];
  if (mode === "payment" && process.env.STRIPE_ENABLE_SWISH === "1") {
    methods.push("swish");
  }
  return methods;
}

/** Absolute origin for Stripe's return URLs. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}
