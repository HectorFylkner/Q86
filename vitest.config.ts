import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Unit and integration tests run against a real libSQL database — a fresh
 * SQLite file per test file, created by `tests/helpers/test-env.ts` before
 * `lib/db` is imported. Nothing is mocked except `next/headers`, because a
 * test of tenant isolation that mocks the database proves nothing.
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: path.resolve(process.cwd(), "$1") },
      {
        find: "next/headers",
        replacement: path.resolve(process.cwd(), "tests/helpers/next-headers.ts"),
      },
      {
        find: "next/cache",
        replacement: path.resolve(process.cwd(), "tests/helpers/next-cache.ts"),
      },
    ],
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    pool: "forks",
    // Each file gets its own process and therefore its own database file.
    isolate: true,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
