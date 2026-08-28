import { expect, test } from "@playwright/test";
import {
  answerCurrentQuestion,
  appNav,
  signIn,
  signOut,
  signUp,
  TEST_PASSWORD,
  uniqueEmail,
} from "./helpers";

/**
 * The privacy-critical flows, exercised through a browser against a real
 * production build: signing up, being kept out while signed out, and one
 * account being unable to reach another's data by guessing a URL.
 */

test.describe("accounts", () => {
  test("a stranger cannot reach the app without an account", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Logga in" })).toBeVisible();

    // The API surface answers 401 rather than redirecting.
    const response = await page.request.get("/api/export");
    expect(response.status()).toBe(401);
  });

  test("sign up, land on the dashboard, sign out, sign back in", async ({
    page,
  }) => {
    const email = uniqueEmail("nykund");

    await signUp(page, email);
    await expect(appNav(page).getByRole("link", { name: "Today" })).toBeVisible();

    await signOut(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);

    await signIn(page, email);
    await page.waitForURL("/");
    await expect(appNav(page).getByRole("link", { name: "Today" })).toBeVisible();
  });

  test("rejects a wrong password without revealing whether the account exists", async ({
    page,
  }) => {
    const email = uniqueEmail("felaktig");
    await signUp(page, email);
    await signOut(page);

    await signIn(page, email, "helt-fel-losenord");
    await expect(page.getByRole("alert").first()).toHaveText(
      "Fel e-postadress eller lösenord.",
    );

    await signIn(page, uniqueEmail("finns-inte"), TEST_PASSWORD);
    await expect(page.getByRole("alert").first()).toHaveText(
      "Fel e-postadress eller lösenord.",
    );
  });

  test("refuses a second account on the same address", async ({ page }) => {
    const email = uniqueEmail("dubblett");
    await signUp(page, email);
    await signOut(page);

    await page.goto("/signup");
    await page.getByLabel("E-post").fill(email);
    await page.getByLabel("Lösenord").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Skapa konto" }).click();
    await expect(page.getByRole("alert").first()).toContainText(
      "redan ett konto",
    );
  });

  test("refuses a password under the length floor", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("E-post").fill(uniqueEmail("kort"));
    // Bypass the browser's minlength so the server check is what answers.
    await page.getByLabel("Lösenord").evaluate((el: HTMLInputElement) => {
      el.removeAttribute("minlength");
    });
    await page.getByLabel("Lösenord").fill("kort");
    await page.getByRole("button", { name: "Skapa konto" }).click();
    await expect(page.getByRole("alert").first()).toContainText(
      "minst 10 tecken",
    );
  });
});

test.describe("tenant isolation in the browser", () => {
  test("one account cannot open another's post-mortem by id", async ({
    browser,
  }) => {
    // Alice signs up and records one attempt, giving her an attempt id.
    const aliceContext = await browser.newContext();
    const alice = await aliceContext.newPage();
    await signUp(alice, uniqueEmail("alice"));

    await alice.goto("/drill");
    await alice.getByRole("button", { name: /^Start drill/ }).click();
    await answerCurrentQuestion(alice);
    await alice.getByRole("button", { name: /Send to post-mortem/ }).click();
    await alice.waitForURL(/\/postmortem\/\d+$/);
    const href = new URL(alice.url()).pathname;
    expect(href).toMatch(/^\/postmortem\/\d+$/);
    await expect(
      alice.getByRole("heading", { name: "Whiteboard post-mortem" }),
    ).toBeVisible();

    // Bob signs up in a separate browser context and tries that exact URL.
    const bobContext = await browser.newContext();
    const bob = await bobContext.newPage();
    await signUp(bob, uniqueEmail("bob"));

    const response = await bob.goto(href as string);
    expect(response?.status()).toBe(404);

    // And his own pages show none of her work.
    await bob.goto("/queue");
    await expect(bob.getByText(/alice/i)).toHaveCount(0);

    await aliceContext.close();
    await bobContext.close();
  });

  test("each account's export contains only its own rows", async ({
    browser,
  }) => {
    const first = await browser.newContext();
    const firstPage = await first.newPage();
    const firstEmail = uniqueEmail("export-a");
    await signUp(firstPage, firstEmail);

    const second = await browser.newContext();
    const secondPage = await second.newPage();
    const secondEmail = uniqueEmail("export-b");
    await signUp(secondPage, secondEmail);

    // Fetched from inside the page, not through Playwright's API context:
    // the session cookie is Secure, and only the browser applies the
    // localhost exception that lets it travel over plain HTTP here.
    const { status, payload } = await secondPage.evaluate(async () => {
      const res = await fetch("/api/export");
      return { status: res.status, payload: await res.json() };
    });
    expect(status).toBe(200);
    expect(payload.account.email).toBe(secondEmail);
    expect(payload.format).toBe("q86-account-export-v2");
    // The shared question bank is not part of a personal export.
    expect(payload.tables.questions).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain(firstEmail);

    await first.close();
    await second.close();
  });
});
