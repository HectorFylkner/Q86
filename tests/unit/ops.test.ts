import "../helpers/test-env.ts";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { apiUsage } from "@/lib/db/schema";
import { createUser } from "@/lib/auth/users";
import { checkBudget, meter, monthKey, monthSpendOre, globalMonthSpendOre } from "@/lib/ops/budget";
import { ROUTE_LIMITS, costOre, METERED_ROUTES } from "@/lib/ops/costs";
import { countView, dayKey, recentViews, shouldCount } from "@/lib/ops/analytics";
import { migrateTestDb } from "../helpers/db";

/**
 * Operations: the two mechanisms whose failure is measured in money, and
 * the one whose failure is measured in trust.
 */

const ROOT = process.cwd();

beforeEach(async () => {
  await migrateTestDb();
  await db.delete(apiUsage);
});

async function account(email: string) {
  return createUser({ email, password: "provlosenord-2026" });
}

describe("cost arithmetic", () => {
  it("rounds up, so a cap can never under-count", () => {
    // One token of output is a fraction of an öre; it must not be free.
    expect(costOre(0, 1)).toBe(1);
    expect(costOre(0, 0)).toBe(0);
  });

  it("charges output more than input", () => {
    expect(costOre(0, 1_000_000)).toBeGreaterThan(costOre(1_000_000, 0));
  });

  it("keys a month in UTC, so the boundary does not move with a reader", () => {
    expect(monthKey(new Date("2026-01-31T23:30:00Z"))).toBe("2026-01");
    expect(monthKey(new Date("2026-02-01T00:30:00Z"))).toBe("2026-02");
  });
});

describe("rate limits", () => {
  it("refuses once the hourly limit is reached, and says when to retry", async () => {
    const user = await account("takt@exempel.se");
    const limit = ROUTE_LIMITS.coach.perHour;
    for (let i = 0; i < limit; i++) {
      await meter({ userId: user.id, route: "coach", ok: true });
    }
    const check = await checkBudget(user.id, "coach");
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.denial.reason).toBe("rate_hour");
      expect(check.denial.retryAfter).toBe(3600);
    }
  });

  it("counts each route separately", async () => {
    const user = await account("perrutt@exempel.se");
    for (let i = 0; i < ROUTE_LIMITS.coach.perHour; i++) {
      await meter({ userId: user.id, route: "coach", ok: true });
    }
    // Coach is spent; parse-report is untouched.
    expect((await checkBudget(user.id, "coach")).ok).toBe(false);
    expect((await checkBudget(user.id, "parse-report")).ok).toBe(true);
  });

  it("counts each account separately", async () => {
    const a = await account("a-takt@exempel.se");
    const b = await account("b-takt@exempel.se");
    for (let i = 0; i < ROUTE_LIMITS.coach.perHour; i++) {
      await meter({ userId: a.id, route: "coach", ok: true });
    }
    expect((await checkBudget(a.id, "coach")).ok).toBe(false);
    expect((await checkBudget(b.id, "coach")).ok).toBe(true);
  });

  it("counts a failed call, because it was still billed", async () => {
    const user = await account("fel@exempel.se");
    await meter({
      userId: user.id,
      route: "coach",
      usage: { inputTokens: 1000, outputTokens: 500 },
      ok: false,
    });
    expect(await monthSpendOre(user.id)).toBeGreaterThan(0);
  });
});

describe("cost caps", () => {
  it("refuses an account that has spent its month", async () => {
    const user = await account("dyr@exempel.se");
    // One enormous call, well past the default 50 kr cap.
    await meter({
      userId: user.id,
      route: "coach",
      usage: { inputTokens: 50_000_000, outputTokens: 50_000_000 },
      ok: true,
    });
    const check = await checkBudget(user.id, "coach");
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.denial.reason).toBe("user_cap");
  });

  it("refuses everyone when the whole service has spent its month", async () => {
    const spender = await account("stor@exempel.se");
    const bystander = await account("oskyldig@exempel.se");
    // Split across many accounts so no single one trips the user cap:
    // the global cap is the one being tested.
    for (let i = 0; i < 60; i++) {
      const other = await account(`spend-${i}@exempel.se`);
      await meter({
        userId: other.id,
        route: "coach",
        usage: { inputTokens: 2_000_000, outputTokens: 2_000_000 },
        ok: true,
      });
    }
    expect(await globalMonthSpendOre()).toBeGreaterThan(200_000);
    const check = await checkBudget(bystander.id, "coach");
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.denial.reason).toBe("global_cap");
    expect(spender.id).toBeTruthy();
  });

  it("does not count last month against this one", async () => {
    const user = await account("forramanad@exempel.se");
    const lastMonth = new Date();
    lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);
    await meter({
      userId: user.id,
      route: "coach",
      usage: { inputTokens: 50_000_000, outputTokens: 50_000_000 },
      ok: true,
      now: lastMonth,
    });
    expect(await monthSpendOre(user.id)).toBe(0);
    expect((await checkBudget(user.id, "coach")).ok).toBe(true);
  });
});

describe("the guard is applied everywhere it must be", () => {
  const ROUTES = [
    "app/api/generate/route.ts",
    "app/api/coach/route.ts",
    "app/api/parse-report/route.ts",
  ];

  it("covers every route that calls the model", () => {
    // Any route that reaches getModel() spends money; if a fourth one
    // appears without the guard, this fails rather than the invoice.
    const spending: string[] = [];
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === "route.ts") {
          const source = fs.readFileSync(full, "utf8");
          if (/getModel\(|createVerifiedQuestion\(/.test(source)) {
            spending.push(path.relative(ROOT, full));
          }
        }
      }
    }
    walk(path.join(ROOT, "app", "api"));
    expect(spending.sort()).toEqual([...ROUTES].sort());

    const unguarded = spending.filter(
      (route) =>
        !fs.readFileSync(path.join(ROOT, route), "utf8").includes(
          "refuseIfOverBudget(",
        ),
    );
    expect(unguarded).toEqual([]);
  });

  it("meters every guarded route as well as refusing on it", () => {
    const unmetered = ROUTES.filter(
      (route) =>
        !fs
          .readFileSync(path.join(ROOT, route), "utf8")
          .includes("recordUsage("),
    );
    expect(unmetered).toEqual([]);
  });

  it("knows about exactly the routes the cost table prices", () => {
    expect([...METERED_ROUTES].sort()).toEqual(
      ROUTES.map((r) => r.split("/")[2]).sort(),
    );
  });
});

describe("cookieless page counting", () => {
  it("counts the public site and nothing else", () => {
    expect(shouldCount("/")).toBe(true);
    expect(shouldCount("/guider/gmat-focus-quant")).toBe(true);
    expect(shouldCount("/priser")).toBe(true);
    // Behind the session: not a funnel, and not anyone's business.
    expect(shouldCount("/idag")).toBe(false);
    expect(shouldCount("/konto")).toBe(false);
    // A share card's URL identifies its owner.
    expect(shouldCount("/kort/abc123")).toBe(false);
    expect(shouldCount("/api/export")).toBe(false);
  });

  it("stores no identifier of any kind", async () => {
    await countView("/priser");
    await countView("/priser");
    const rows = await recentViews(30);
    const priser = rows.find((r) => r.path === "/priser");
    expect(priser?.views).toBe(2);

    // The whole row, as stored. If a column ever appears that could
    // identify someone, this is where it shows up.
    const raw = await db.query.pageViews.findFirst();
    expect(Object.keys(raw ?? {}).sort()).toEqual([
      "day",
      "id",
      "path",
      "views",
    ]);
  });

  it("keys a day in UTC", () => {
    expect(dayKey(new Date("2026-03-01T00:30:00Z"))).toBe("2026-03-01");
  });
});

describe("the privacy policy matches what the code does", () => {
  it("says the analytics are cookieless and consent-gated where they are", () => {
    const policy = fs.readFileSync(
      path.join(ROOT, "content/legal/sv/integritetspolicy.md"),
      "utf8",
    );
    expect(policy).toMatch(/nödvändiga cookies/);
    expect(policy).toMatch(/Analys aktiveras först om du klickar/);
  });
});
