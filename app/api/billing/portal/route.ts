import { NextResponse } from "next/server";
import { NotAuthenticatedError, requireUser } from "@/lib/auth/session";
import {
  BillingUnavailableError,
  createPortalSession,
} from "@/lib/billing/checkout";
import { stripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hands the customer to Stripe's own portal: cards, invoices, cancelling.
 *  Building those screens ourselves would be worse and less trustworthy. */
export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof NotAuthenticatedError) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    throw e;
  }

  if (!stripeConfigured()) {
    return NextResponse.json({ error: "billing_unconfigured" }, { status: 503 });
  }

  try {
    const { url } = await createPortalSession(user);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof BillingUnavailableError) {
      return NextResponse.json(
        { error: "no_customer", detail: e.message },
        { status: 409 },
      );
    }
    console.error("[billing] portal failed", e);
    return NextResponse.json({ error: "portal_failed" }, { status: 502 });
  }
}
