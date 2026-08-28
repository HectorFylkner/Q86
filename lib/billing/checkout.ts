import type Stripe from "stripe";
import {
  attachStripeCustomer,
  ensureSubscriptionRow,
  stripeCustomerFor,
} from "./entitlements.ts";
import { paymentMethodTypes, siteUrl, stripeClient } from "./stripe.ts";
import { PLANS, stripePriceId, type PlanId } from "./pricing.ts";
import type { SessionUser } from "../auth/session.ts";

/**
 * Building a Checkout Session (ADR 0003).
 *
 * Three things are deliberate here. Stripe Tax is on, so the Swedish moms
 * assumption in ADR 0003 is a default rather than a hard-coded truth and a
 * customer elsewhere is charged their own rate. The plan and the account
 * are stamped into metadata on both the session and the subscription, so
 * the webhook can trace an event to an account without depending on the
 * customer lookup succeeding. And the withdrawal-right waiver is collected
 * at checkout, because distansavtalslagen requires express consent before
 * digital content is delivered inside the 14-day period.
 */

export class BillingUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingUnavailableError";
  }
}

/** Reuses the account's Stripe customer, or creates and binds one. */
export async function customerFor(user: SessionUser): Promise<string> {
  await ensureSubscriptionRow(user.id);
  const existing = await stripeCustomerFor(user.id);
  if (existing) return existing;

  const customer = await stripeClient().customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { q86_user_id: user.id },
    preferred_locales: [user.locale === "en" ? "en" : "sv"],
  });
  await attachStripeCustomer(user.id, customer.id);
  // Re-read: if a concurrent request bound a different customer first, that
  // one wins and this one is abandoned rather than overwriting it.
  return (await stripeCustomerFor(user.id)) ?? customer.id;
}

export async function createCheckoutSession(
  user: SessionUser,
  plan: PlanId,
): Promise<{ url: string }> {
  if (plan === "free") {
    throw new BillingUnavailableError("The free plan needs no checkout.");
  }
  const priceId = stripePriceId(plan);
  if (!priceId) {
    throw new BillingUnavailableError(
      `No Stripe price is configured for the ${plan} plan ` +
        `(set ${PLANS[plan].priceIdEnv}).`,
    );
  }

  const mode: "subscription" | "payment" =
    PLANS[plan].billing === "recurring_month" ? "subscription" : "payment";
  const customer = await customerFor(user);
  const base = siteUrl();
  const metadata = { q86_user_id: user.id, q86_plan: plan };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    customer,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_types: paymentMethodTypes(mode),
    locale: user.locale === "en" ? "en" : "sv",
    metadata,
    automatic_tax: { enabled: true },
    // Stripe Tax needs a billing address to pick a rate.
    customer_update: { address: "auto", name: "auto" },
    billing_address_collection: "auto",
    // Express consent to immediate delivery, which is what makes the
    // 14-day withdrawal right waivable for digital content.
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message:
          "Jag godkänner köpvillkoren och samtycker till att Q86 levereras " +
          "omedelbart. Jag är införstådd med att ångerrätten enligt " +
          "distansavtalslagen därmed upphör när tillgången öppnas.",
      },
    },
    success_url: `${base}/konto?betalning=klar&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/konto?betalning=avbruten`,
  };

  if (mode === "subscription") {
    params.subscription_data = { metadata };
  } else {
    // A one-time purchase still deserves a receipt a Swedish buyer can file.
    params.invoice_creation = { enabled: true };
    params.payment_intent_data = { metadata };
  }

  const session = await stripeClient().checkout.sessions.create(params);
  if (!session.url) {
    throw new BillingUnavailableError("Stripe returned a session with no URL.");
  }
  return { url: session.url };
}

export async function createPortalSession(
  user: SessionUser,
): Promise<{ url: string }> {
  const customer = await stripeCustomerFor(user.id);
  if (!customer) {
    throw new BillingUnavailableError(
      "This account has no Stripe customer yet — there is nothing to manage.",
    );
  }
  const session = await stripeClient().billingPortal.sessions.create({
    customer,
    return_url: `${siteUrl()}/konto`,
    locale: user.locale === "en" ? "en" : "sv",
  });
  return { url: session.url };
}
