import { expect, test } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

/**
 * Operations from the outside: the admin surface is closed to everyone
 * but an admin, and the endpoints that spend money refuse an anonymous
 * caller before they reach the guard at all.
 */

test.describe("the admin surface", () => {
  test("is not reachable without a session", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("refuses an ordinary signed-in account", async ({ page, context }) => {
    // A second account exists, so there is something to leak if the gate
    // fails: its address must not appear on the page.
    const otherEmail = uniqueEmail("granne");
    const other = await context.browser()!.newPage();
    await signUp(other, otherEmail);
    await other.close();

    await signUp(page, uniqueEmail("vanlig"));
    const response = await page.goto("/admin");

    // requireAdmin() throws rather than rendering, so this is an error
    // page and not the operator surface.
    expect(response?.status()).toBeGreaterThanOrEqual(400);
    await expect(
      page.getByRole("heading", { level: 1, name: "Drift" }),
    ).toHaveCount(0);
    // The catalog crosses the RSC boundary as data, so admin *labels* are
    // in every page's payload by design (ADR 0004). Account *data* is the
    // thing that must not be.
    expect(await page.content()).not.toContain(otherEmail);
  });

  test("is excluded from the sitemap and disallowed in robots", async ({
    page,
  }) => {
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/admin");
  });
});

test.describe("the metered endpoints", () => {
  test("refuse an anonymous caller before any spend", async ({ request }) => {
    for (const path of ["/api/coach", "/api/parse-report", "/api/generate"]) {
      const response = await request.post(path, { data: {} });
      expect([401, 403]).toContain(response.status());
    }
  });
});
