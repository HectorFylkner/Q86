import assert from "node:assert/strict";
import test from "node:test";

import { attemptIsPersisted } from "../components/drill/runner-persistence.ts";

test("runner advances only after an attempt has a server-issued id", () => {
  assert.equal(
    attemptIsPersisted({ attemptId: null, saveState: "saving" }),
    false,
  );
  assert.equal(
    attemptIsPersisted({ attemptId: null, saveState: "failed" }),
    false,
  );
  assert.equal(
    attemptIsPersisted({ attemptId: null, saveState: "saved" }),
    false,
  );
  assert.equal(
    attemptIsPersisted({ attemptId: 42, saveState: "saved" }),
    true,
  );
});
