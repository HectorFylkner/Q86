import { expect, test } from "@playwright/test";
import {
  appNav,
  signUp,
  signUpToOnboarding,
  uniqueEmail,
} from "./helpers";

/**
 * Retention from the outside: onboarding actually reaches the plan, a
 * referral link pre-fills and pays out, and a progress card is shareable
 * without leaking who it belongs to.
 */

test.describe("onboarding", () => {
  test("takes a test date and shows the week that answer produces", async ({
    page,
  }) => {
    await signUpToOnboarding(page, uniqueEmail("ombord"));
    await expect(
      page.getByRole("heading", { level: 1, name: "Innan du börjar" }),
    ).toBeVisible();

    // A date six weeks out, so the plan has a runway to schedule against.
    const testDate = new Date(Date.now() + 42 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    await page.getByLabel("När skriver du provet?").fill(testDate);
    await page.getByText("Var 7:e dag").click();
    await page.getByRole("button", { name: "Visa min första vecka" }).click();

    await expect(
      page.getByRole("heading", { name: "Din första vecka" }),
    ).toBeVisible();
    // Exact, because "Börja med dag 1" also contains the phrase.
    await expect(page.getByText("Dag 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Dag 7", { exact: true })).toBeVisible();
    await expect(page.getByText(/dagar kvar/)).toBeVisible();

    await page.getByRole("link", { name: "Börja med dag 1" }).click();
    await expect(page).toHaveURL(/\/idag$/);
    // The date reached the dashboard, which is the only proof the answer
    // was stored rather than just displayed.
    await expect(appNav(page).getByRole("link", { name: "I dag" })).toBeVisible();
    await expect(page.getByText("dagar till provet")).toBeVisible();
  });

  test("can be skipped without blocking the app", async ({ page }) => {
    await signUpToOnboarding(page, uniqueEmail("hoppa"));
    await page.getByRole("link", { name: "Hoppa över" }).click();
    await expect(page).toHaveURL(/\/idag$/);
  });
});

test.describe("referrals", () => {
  test("pays both sides and pre-fills the code from the link", async ({
    page,
    context,
  }) => {
    const inviterEmail = uniqueEmail("inbjudare");
    await signUp(page, inviterEmail);

    await page.goto("/konto");
    await page.getByRole("button", { name: "Bjud in någon" }).click();
    const code = await page
      .locator("code")
      .first()
      .innerText();
    expect(code).toMatch(/^[2-9BCDFGHJKLMNPQRSTVWXYZ]{7}$/);

    // A second visitor follows the link: the field arrives filled in.
    const guest = await context.browser()!.newPage();
    await guest.goto(`${page.url().split("/konto")[0]}/signup?kod=${code}`);
    const field = guest.getByLabel(/Inbjudningskod/);
    await expect(field).toHaveValue(code);

    await guest.getByLabel("E-post").fill(uniqueEmail("inbjuden"));
    await guest.getByLabel("Lösenord").fill("provlosenord-2026");
    await guest.getByRole("button", { name: "Skapa konto" }).click();
    await guest.waitForURL("/valkommen");

    // The invitee has paid features without paying: timed sets open.
    await guest.goto("/timed");
    await expect(guest).toHaveURL(/\/timed$/);

    // And the inviter's count moved.
    await page.reload();
    await expect(page.getByText(/1 personer har använt din kod/)).toBeVisible();
    await guest.close();
  });
});

test.describe("the progress card", () => {
  test("is shareable, anonymous, and revocable", async ({ page, context }) => {
    const email = uniqueEmail("kortagare");
    await signUp(page, email);

    await page.goto("/konto");
    await page.getByRole("button", { name: "Skapa länk" }).click();
    const link = await page
      .locator("code")
      .filter({ hasText: "/kort/" })
      .first()
      .innerText();
    expect(link).toContain("/kort/");

    const path = `/kort/${link.split("/kort/")[1]}`;
    const visitor = await context.browser()!.newPage();
    await visitor.goto(`${page.url().split("/konto")[0]}${path}`);

    await expect(
      visitor.getByRole("heading", { level: 1, name: /dagars svit/ }),
    ).toBeVisible();
    // Nothing on the card identifies its owner.
    const html = await visitor.content();
    expect(html).not.toContain(email);

    // Revoking breaks the link that was already shared.
    await page.getByRole("button", { name: "Återkalla länken" }).click();
    await expect(page.getByRole("button", { name: "Skapa länk" })).toBeVisible();
    await visitor.reload();
    await expect(visitor.getByText(/Kortet finns inte/)).toBeVisible();
    await visitor.close();
  });
});
