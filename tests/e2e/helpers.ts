import path from "node:path";
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

/**
 * Put an account on a paid plan by writing to the end-to-end database
 * directly.
 *
 * This is the test harness editing its own fixture, not a product
 * backdoor: there is no route, action or flag in the application that does
 * this. Granting a plan through the product requires Stripe, and no test
 * environment here has keys — see docs/BILLING.md for the manual
 * test-mode procedure.
 */
export async function grantPaidPlan(
  email: string,
  plan: "monthly" | "sprint" = "monthly",
): Promise<void> {
  const { createClient } = await import("@libsql/client");
  const dbPath = path.join(process.cwd(), "data", "e2e.db");
  const client = createClient({ url: `file:${dbPath}` });
  try {
    const user = await client.execute({
      sql: "select id from users where email = ?",
      args: [email.toLowerCase()],
    });
    if (user.rows.length === 0) {
      throw new Error(`grantPaidPlan: no account for ${email}`);
    }
    const userId = String(user.rows[0].id);
    const periodEnd = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await client.execute({
      sql: `insert into subscriptions
              (user_id, plan, status, current_period_end, cancel_at_period_end)
            values (?, ?, 'active', ?, 0)
            on conflict(user_id) do update set
              plan = excluded.plan,
              status = 'active',
              current_period_end = excluded.current_period_end`,
      args: [userId, plan, periodEnd],
    });
  } finally {
    client.close();
  }
}

/** Sign up and immediately put the account on a paid plan. */
export async function signUpPaid(page: Page, email: string): Promise<void> {
  await signUp(page, email);
  await grantPaidPlan(email);
}
