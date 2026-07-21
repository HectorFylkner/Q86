import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    // Keep Vitest intentionally additive: the established node:test files at
    // tests/*.test.ts continue to run through `pnpm test:native`.
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
