import { describe, expect, it, vi } from "vitest";
import { runDatabaseBootstrap } from "../../instrumentation.ts";

describe("database instrumentation bootstrap", () => {
  it("records readiness after a successful bootstrap", async () => {
    const info = vi.fn();
    const error = vi.fn();

    await expect(
      runDatabaseBootstrap(async () => undefined, { info, error }),
    ).resolves.toBe(true);
    expect(info).toHaveBeenCalledWith("Q86 bootstrap: database ready.");
    expect(error).not.toHaveBeenCalled();
  });

  it("starts in degraded mode instead of rejecting worker startup", async () => {
    const info = vi.fn();
    const error = vi.fn();
    const timeout = Object.assign(new Error("fetch failed"), {
      cause: { code: "ETIMEDOUT" },
    });

    await expect(
      runDatabaseBootstrap(async () => Promise.reject(timeout), {
        info,
        error,
      }),
    ).resolves.toBe(false);
    expect(info).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Q86 bootstrap: database unavailable; worker started in degraded mode.",
      expect.objectContaining({
        name: "Error",
        message: "fetch failed",
        causeCode: "ETIMEDOUT",
      }),
    );
  });
});
