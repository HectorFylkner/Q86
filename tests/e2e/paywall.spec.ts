import { expect, test } from "@playwright/test";
import { appNav, signUp, uniqueEmail } from "./helpers";

/**
 * The paywall from the outside: what a new (free) account can reach, what
 * it is redirected away from, and what the pricing surface tells it.
 *
 * The Stripe half — a test-mode purchase actually upgrading the account —
 * needs STRIPE_SECRET_KEY, which no test environment here has. That path is
 * covered against real Stripe event shapes in tests/unit/billing.test.ts,
 * and the manual procedure is in docs/BILLING.md.
 */

test.describe("free tier", () => {
  test("reaches the chapters, the trainer and a capped drill", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("gratis"));

    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Lär" })).toBeVisible();

    await page.goto("/patterns");
    await expect(
      page.getByRole("heading", { name: "Mönsterträning" }),
    ).toBeVisible();

    await page.goto("/drill");
    await expect(
      page.getByRole("button", { name: /^Starta träning/ }),
    ).toBeVisible();

    // The dashboard says what the free tier is, without nagging.
    await page.goto("/idag");
    await expect(page.getByText("Gratisnivån.")).toBeVisible();
    await expect(page.getByText(/0 \/ 10 i dag/)).toBeVisible();
  });

  test("is redirected from every paid surface to the account page", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("blockerad"));

    const gated: Array<[string, string]> = [
      ["/timed", "timed"],
      ["/queue", "queue"],
      ["/deck", "deck"],
      ["/analytics", "analytics"],
      ["/mastery", "mastery"],
      ["/decide", "decide"],
      ["/import", "import"],
    ];

    for (const [path, feature] of gated) {
      await page.goto(path);
      await expect(page).toHaveURL(`/konto?las=${feature}`);
      await expect(
        page.getByText("ingår inte i din plan"),
      ).toBeVisible();
    }
  });

  test("shows three plans with VAT-inclusive kronor prices", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("priser"));
    await page.goto("/konto");

    // The cards are h3; the current-plan summary above them is an h2 with
    // the same text, so scope to the card headings.
    const cards = page.locator("h3");
    await expect(cards.filter({ hasText: "Gratis" })).toBeVisible();
    await expect(cards.filter({ hasText: "Månad" })).toHaveCount(1);
    await expect(cards.filter({ hasText: "GMAT-sprint" })).toBeVisible();

    const body = await page.locator("body").innerText();
    // Non-breaking and narrow-no-break spaces are what Intl emits.
    const normalised = body.replace(/[  ]/g, " ");
    expect(normalised).toContain("249 kr");
    expect(normalised).toContain("599 kr");
    expect(normalised).toContain("inkl. 49,80 kr moms");
    // The badge is CSS-uppercased, and innerText reports rendered text.
    expect(normalised.toLowerCase()).toContain("din plan");

    // Q86's own plan is the current one, so no checkout button for it.
    await expect(
      page.getByRole("button", { name: "Välj Månad" }),
    ).toBeVisible();
  });

  test("says plainly when the deployment cannot take payments", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("okonfigurerad"));
    await page.goto("/konto");
    // This environment has no STRIPE_SECRET_KEY, which must read as a
    // clear message rather than a broken button.
    await expect(
      page.getByText("Betalningar är inte konfigurerade"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Välj Månad" })).toBeDisabled();
  });

  test("refuses checkout and portal calls that carry no session", async ({
    request,
  }) => {
    for (const path of ["/api/billing/checkout", "/api/billing/portal"]) {
      const response = await request.post(path, { data: { plan: "monthly" } });
      expect(response.status()).toBe(401);
    }
  });

  test("rejects an unsigned webhook", async ({ request }) => {
    const response = await request.post("/api/billing/webhook", {
      data: { id: "evt_forged", type: "customer.subscription.created" },
    });
    // 503 without Stripe configured, 400 with it: never 200, and never an
    // applied entitlement.
    expect([400, 503]).toContain(response.status());
  });

  test("can always reach the account page and export", async ({ page }) => {
    await signUp(page, uniqueEmail("export-gratis"));
    await expect(appNav(page).getByRole("link", { name: "I dag" })).toBeVisible();
    await page.goto("/konto");
    await expect(
      page.getByRole("link", { name: /Ladda ner mina uppgifter/ }),
    ).toBeVisible();
  });
});
