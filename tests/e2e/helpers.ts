import path from "node:path";
import { expect, type Page } from "@playwright/test";

/** A distinct address per test, so runs never collide in the shared
 *  end-to-end database (the app provisions it on first request). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exempel.se`;
}

export const TEST_PASSWORD = "provlosenord-2026";

/**
 * The credential screens are translated, and a test may be running in
 * either language, so these helpers match both. Asserting *which*
 * language is showing is the language spec's job, not a side effect of
 * signing in — a helper that only spoke Swedish would deadlock the moment
 * a test toggled to English.
 */
const EMAIL_FIELD = /^(E-post|Email)$/;
const PASSWORD_FIELD = /^(Lösenord|Password)$/;
const SIGN_UP = /^(Skapa konto|Create account)$/;
const SIGN_IN = /^(Logga in|Sign in)$/;
const SIGN_OUT = /^(Logga ut|Sign out)$/;

/**
 * Sign up and land in the application.
 *
 * A real signup goes to onboarding first (M5), which every test but the
 * onboarding spec wants to skip — so this helper follows that redirect and
 * then walks on to the dashboard, which is where the rest of the suite
 * expects to start.
 */
export async function signUp(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel(EMAIL_FIELD).fill(email);
  await page.getByLabel(PASSWORD_FIELD).fill(password);
  await page.getByRole("button", { name: SIGN_UP }).click();
  await page.waitForURL("/valkommen");
  await page.goto("/idag");
}

/** Sign up and stop at onboarding, for the tests that are about it. */
export async function signUpToOnboarding(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel(EMAIL_FIELD).fill(email);
  await page.getByLabel(PASSWORD_FIELD).fill(password);
  await page.getByRole("button", { name: SIGN_UP }).click();
  await page.waitForURL("/valkommen");
}

export async function signIn(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel(EMAIL_FIELD).fill(email);
  await page.getByLabel(PASSWORD_FIELD).fill(password);
  await page.getByRole("button", { name: SIGN_IN }).click();
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: SIGN_OUT }).click();
  await page.waitForURL(/\/login/);
}

/** The primary app navigation, which only a signed-in session renders.
 *  Its accessible name is translated, so callers on an English account
 *  pass "Primary"; Swedish is the default a new account gets. */
export function appNav(page: Page, name = "Huvudmeny") {
  return page.getByRole("navigation", { name });
}

/** The answer choices, distinguished from the confidence picker — both are
 *  radiogroups. */
export function choices(page: Page) {
  return page
    .getByRole("radiogroup", { name: "Svarsalternativ" })
    .getByRole("radio");
}

export function confidence(page: Page) {
  return page.getByRole("radiogroup", { name: "Säkerhet" }).getByRole("radio");
}

/** Answer the question on screen: pick a choice, state confidence, confirm. */
export async function answerCurrentQuestion(
  page: Page,
  choiceIndex = 0,
): Promise<void> {
  await expect(choices(page).first()).toBeVisible();
  await choices(page).nth(choiceIndex).click();
  await confidence(page).nth(1).click();
  await page.getByRole("button", { name: /Bekräfta svar/ }).click();
  // The solution panel appearing is how we know the attempt was saved.
  await expect(
    page.getByRole("button", { name: /Skicka till genomgång/ }),
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
