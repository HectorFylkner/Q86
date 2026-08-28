import { expect, type Page } from "@playwright/test";

/** A distinct address per test, so runs never collide in the shared
 *  end-to-end database (the app provisions it on first request). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exempel.se`;
}

export const TEST_PASSWORD = "provlosenord-2026";

export async function signUp(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Lösenord").fill(password);
  await page.getByRole("button", { name: "Skapa konto" }).click();
  await page.waitForURL("/");
}

export async function signIn(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Lösenord").fill(password);
  await page.getByRole("button", { name: "Logga in" }).click();
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Logga ut" }).click();
  await page.waitForURL(/\/login/);
}

/** The primary app navigation, which only a signed-in session renders. */
export function appNav(page: Page) {
  return page.getByRole("navigation", { name: "Primary" });
}

/** The answer choices, distinguished from the confidence picker — both are
 *  radiogroups. */
export function choices(page: Page) {
  return page
    .getByRole("radiogroup", { name: "Answer choices" })
    .getByRole("radio");
}

export function confidence(page: Page) {
  return page.getByRole("radiogroup", { name: "Confidence" }).getByRole("radio");
}

/** Answer the question on screen: pick a choice, state confidence, confirm. */
export async function answerCurrentQuestion(
  page: Page,
  choiceIndex = 0,
): Promise<void> {
  await expect(choices(page).first()).toBeVisible();
  await choices(page).nth(choiceIndex).click();
  await confidence(page).nth(1).click();
  await page.getByRole("button", { name: /Confirm answer/ }).click();
  // The solution panel appearing is how we know the attempt was saved.
  await expect(
    page.getByRole("button", { name: /Send to post-mortem/ }),
  ).toBeEnabled();
}
