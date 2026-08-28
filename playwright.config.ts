import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end coverage for the flows where money and privacy live. These
 * run against a real production build with its own SQLite file, which the
 * app provisions and seeds itself on first request — the same cold-start
 * path a fresh deployment takes.
 */
/**
 * Chromium ships with the image under PLAYWRIGHT_BROWSERS_PATH, but its
 * build number tracks whichever Playwright release installed it, which is
 * not necessarily the one in package.json. Resolve the binary that is
 * actually present rather than letting Playwright ask for a download.
 */
function installedChromium(): string | undefined {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!fs.existsSync(root)) return undefined;
  const candidates = fs
    .readdirSync(root)
    .filter((name) => name.startsWith("chromium-"))
    .sort()
    .reverse()
    .map((name) => path.join(root, name, "chrome-linux", "chrome"));
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const E2E_DB = path.join(process.cwd(), "data", "e2e.db");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH ?? installedChromium(),
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: BASE_URL,
    // Never reuse: a leftover server serves whatever `.next` it started
    // with, against whatever database file it opened. Reusing one has
    // produced both a false green (an old bundle passing) and a false red
    // (a server holding a deleted database), so every run starts its own.
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "production",
      TURSO_DATABASE_URL: `file:${E2E_DB}`,
      // No AI key: the endpoints that spend money must stay unreachable.
      ANTHROPIC_API_KEY: "",
    },
  },
});
