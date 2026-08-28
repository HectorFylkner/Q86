import { expect, test } from "@playwright/test";
import {
  answerCurrentQuestion,
  choices,
  signUpPaid,
  uniqueEmail,
} from "./helpers";

/**
 * A drill from setup to summary against the real committed bank, on a
 * database the app provisioned and seeded itself. This is the product's
 * core loop; if it breaks, nothing else matters.
 */
test("a new account can run a drill end to end", async ({ page }) => {
  // Paid, so the run can end where a paying customer's does: the redo
  // queue and the analytics page. The free tier's own limits are covered
  // in paywall.spec.ts.
  await signUpPaid(page, uniqueEmail("drill"));

  await page.goto("/drill");
  await expect(
    page.getByRole("button", { name: /^Starta träning/ }),
  ).toBeVisible();

  // A fresh account sees no generation controls: extending the shared bank
  // is an operator action.
  await expect(page.getByText("Generera fler frågor")).toHaveCount(0);

  await page.getByRole("button", { name: /^Starta träning/ }).click();
  await expect(choices(page).first()).toBeVisible();

  // Three questions, then the run ends.
  for (let i = 0; i < 3; i++) {
    await answerCurrentQuestion(page, i % 5);
    await page.getByRole("button", { name: /Nästa fråga|Avsluta/ }).click();
  }

  // The work shows up in the account's own history.
  await page.goto("/queue");
  await expect(
    page.getByRole("heading", { name: /Repetitionskö/ }),
  ).toBeVisible();

  await page.goto("/analytics");
  await expect(
    page.getByRole("heading", { name: "Analys" }),
  ).toBeVisible();
});

test("the AI endpoints refuse an anonymous caller", async ({ request }) => {
  for (const path of ["/api/coach", "/api/generate", "/api/parse-report"]) {
    const response = await request.post(path, { data: {} });
    expect([401, 403]).toContain(response.status());
  }
});
