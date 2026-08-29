import { expect, test } from "@playwright/test";
import { appNav, signIn, signOut, signUp, uniqueEmail } from "./helpers";

/**
 * The language toggle and the boundary it must never cross.
 *
 * The interface, the chapter prose and the coaching follow the account's
 * locale. Question stems, answer choices and Data Sufficiency statements
 * stay in English in both locales, because that is how the exam presents
 * them (ADR 0004). A test that only checked the toggle would let the
 * second half rot silently, so both are asserted here.
 */

/** The compact toggle in the header labels its buttons with the codes. */
function localeButton(page: import("@playwright/test").Page, code: "sv" | "en") {
  return page.getByRole("group", { name: /Språk|Language/ }).getByRole("button", {
    name: code,
    exact: true,
  });
}

test.describe("language", () => {
  test("starts in Swedish, follows the toggle, and survives a new session", async ({
    page,
  }) => {
    // Anonymous and Swedish, even though this browser asks for en-US:
    // Accept-Language is deliberately not consulted (ADR 0004).
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Logga in" })).toBeVisible();

    const email = uniqueEmail("sprak");
    await signUp(page, email);

    await expect(appNav(page).getByRole("link", { name: "I dag" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "I dag" })).toBeVisible();

    await localeButton(page, "en").click();
    await expect(appNav(page, "Primary").getByRole("link", { name: "Today" })).toBeVisible();

    // The choice is stored on the account, not only in a cookie, so it
    // holds across a navigation and across a fresh sign-in.
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();

    await signOut(page);
    await signIn(page, email);
    await page.waitForURL("/idag");
    await expect(appNav(page, "Primary").getByRole("link", { name: "Today" })).toBeVisible();

    await localeButton(page, "sv").click();
    await expect(appNav(page).getByRole("link", { name: "I dag" })).toBeVisible();
  });

  test("a new account inherits the language its signup form was read in", async ({
    page,
  }) => {
    // The toggle is on the credential screens precisely so an English
    // reader is not forced through a Swedish signup and then a settings
    // hunt afterwards.
    await page.goto("/signup");
    await localeButton(page, "en").click();
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.getByLabel("Email").fill(uniqueEmail("english"));
    await page.getByLabel("Password").fill("provlosenord-2026");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("/idag");

    await expect(
      appNav(page, "Primary").getByRole("link", { name: "Today" }),
    ).toBeVisible();
  });

  test("translates the chapter prose but never the worked example", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail("kapitel"));
    await page.goto("/learn/probability");

    // Swedish: the section furniture and the prose are translated.
    await expect(
      page.getByRole("heading", { name: "Kärnidéerna" }),
    ).toBeVisible();
    await expect(page.getByText(/kombinatorik i förklädnad/)).toBeVisible();

    // …and the worked example's stem is still the English the exam uses.
    // The maths renderer splits the stem across text nodes at every `$…$`,
    // so this matches the longest run of plain prose inside it.
    const stem = /Two marbles are drawn at random without replacement/;
    await expect(page.getByText(stem).first()).toBeVisible();

    await localeButton(page, "en").click();
    await expect(
      page.getByRole("heading", { name: "The core ideas" }),
    ).toBeVisible();
    await expect(page.getByText(/counting problems in disguise/)).toBeVisible();
    // Unchanged by the toggle, which is the entire point of the boundary.
    await expect(page.getByText(stem).first()).toBeVisible();
  });
});
