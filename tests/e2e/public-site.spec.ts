import { expect, test } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

/**
 * The acquisition funnel from the outside: what a stranger can reach, that
 * the diagnostic actually works without an account, and that the public
 * pages do not quietly leak the application or the bank's answer key.
 */

test.describe("public site", () => {
  test("serves the landing page, pricing, guides and legal pages to a stranger", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const [path, heading] of [
      ["/priser", "Priser"],
      ["/diagnos", "Gratis diagnos"],
      ["/guider", "Guider"],
      ["/integritetspolicy", "Integritetspolicy"],
      ["/kopvillkor", "Köpvillkor"],
      ["/angerratt", "Ångerrätt"],
    ] as const) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
    }
  });

  test("still sends a stranger from the application to the login form", async ({
    page,
  }) => {
    // Opening the public site must not have opened the app with it.
    await page.goto("/idag");
    await expect(page).toHaveURL(/\/login/);
  });

  test("publishes a sitemap and a robots file that agree with each other", async ({
    page,
  }) => {
    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const path of ["/priser", "/diagnos", "/guider", "/angerratt"]) {
      expect(xml).toContain(path);
    }
    // Nothing behind the session may be advertised.
    expect(xml).not.toContain("/idag");
    expect(xml).not.toContain("/konto");

    const robots = await page.request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const text = await robots.text();
    expect(text).toContain("Sitemap:");
    expect(text).toMatch(/Disallow: \/idag/);
  });

  test("renders a guide with its prose, table and structured data", async ({
    page,
  }) => {
    await page.goto("/guider/gmat-vs-hogskoleprovet");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Högskoleprovet",
    );
    // The guide renderer's table support, which the lesson renderer lacks.
    await expect(page.locator("article table")).toBeVisible();
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .innerText();
    expect(JSON.parse(jsonLd)["@type"]).toBe("Article");
  });
});

test.describe("free diagnostic", () => {
  test("runs twelve questions without an account and never ships the key", async ({
    page,
  }) => {
    await page.goto("/diagnos");
    await page.getByRole("button", { name: "Starta diagnosen" }).click();

    const choices = page
      .getByRole("radiogroup", { name: "Svarsalternativ" })
      .getByRole("radio");
    await expect(choices.first()).toBeVisible();

    // Answer all twelve. The last one carries the finish button instead.
    for (let i = 0; i < 12; i++) {
      await expect(page.getByText(`Fråga ${i + 1} av 12`)).toBeVisible();
      await choices.nth(i % 5).click();
      const last = i === 11;
      await page
        .getByRole("button", { name: last ? "Se resultatet" : "Nästa" })
        .click();
    }

    // The result: a band, a per-skill breakdown and a real week of plan.
    await expect(page.getByText(/^Q\d{2}–Q\d{2}$/)).toBeVisible();
    await expect(page.getByText("Uppskattad kvantnivå")).toBeVisible();
    await expect(page.getByText("Dag 1")).toBeVisible();
    await expect(page.getByText("Dag 7")).toBeVisible();

    // Account creation is offered, not demanded — the result came first.
    await expect(
      page.getByRole("link", { name: "Skapa konto" }),
    ).toBeVisible();
  });

  test("does not put the correct answers in the page", async ({ page }) => {
    await page.goto("/diagnos");
    const html = await page.content();
    // The client is handed stems and choices; `correctIndex` and the
    // solutions stay on the server, or the diagnostic would be a scraper's
    // route into the verified bank.
    expect(html).not.toContain("correctIndex");
    expect(html).not.toContain("solutionMd");
    expect(html).not.toContain("trapMap");
  });

  test("is reachable from the landing page in one click", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Gör diagnosen/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/diagnos$/);
  });
});

test.describe("public site and a session", () => {
  test("points a signed-in reader at the app rather than at a login form", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("besokare"));
    await page.goto("/priser");
    // The header's call to action, which sits beside the nav rather than
    // inside it, points into the app instead of at "Kom igång".
    await expect(
      page.getByRole("banner").getByRole("link", { name: "I dag" }),
    ).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Kom igång" }),
    ).toHaveCount(0);
  });
});
