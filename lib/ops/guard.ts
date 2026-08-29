import { NextResponse } from "next/server";
import { checkBudget, meter, type Usage } from "./budget.ts";
import type { MeteredRoute } from "./costs.ts";

/**
 * One helper for all three metered routes, so the guard cannot be applied
 * differently in three places — or forgotten in a fourth.
 *
 * `tests/unit/ops.test.ts` asserts that every route which imports a model
 * also calls this, which is what makes "forgotten in a fourth" a failing
 * test rather than an invoice.
 */

export type Denied = { response: NextResponse };

/** Refuse the call, or return null to proceed. */
export async function refuseIfOverBudget(
  userId: string,
  route: MeteredRoute,
): Promise<NextResponse | null> {
  const check = await checkBudget(userId, route);
  if (check.ok) return null;

  const { denial } = check;
  const headers = new Headers();
  if (denial.retryAfter !== null) {
    headers.set("Retry-After", String(denial.retryAfter));
  }
  return NextResponse.json(
    {
      error: "over_budget",
      // A machine-readable reason, so the interface can say which limit
      // was hit in the reader's own language rather than echoing English.
      reason: denial.reason,
      retryAfter: denial.retryAfter,
    },
    { status: 429, headers },
  );
}

/** Record what the call cost. Never throws: a metering failure must not
 *  turn a successful answer into an error for the user. */
export async function recordUsage(
  userId: string,
  route: MeteredRoute,
  usage: Usage | undefined,
  ok: boolean,
): Promise<void> {
  try {
    await meter({ userId, route, usage, ok });
  } catch (error) {
    console.error(`[ops] failed to meter ${route} for ${userId}:`, error);
  }
}
