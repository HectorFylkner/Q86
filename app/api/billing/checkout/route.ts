import { NextResponse } from "next/server";
import { z } from "zod";
import { NotAuthenticatedError, requireUser } from "@/lib/auth/session";
import {
  BillingUnavailableError,
  createCheckoutSession,
} from "@/lib/billing/checkout";
import { isPlanId } from "@/lib/billing/pricing";
import { stripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  plan: z.string().refine(isPlanId, "unknown plan"),
});

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: "billing_unconfigured" },
      { status: 503 },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  try {
    const { url } = await createCheckoutSession(user, body.plan);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof BillingUnavailableError) {
      return NextResponse.json(
        { error: "billing_unconfigured", detail: e.message },
        { status: 503 },
      );
    }
    console.error("[billing] checkout failed", e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
