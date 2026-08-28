import "../helpers/test-env.ts";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { authSessions, authTokens, users } from "@/lib/db/schema";
import {
  hashPassword,
  passwordProblem,
  verifyPassword,
} from "@/lib/auth/password";
import {
  consumeToken,
  createUser,
  findUserByEmail,
  issueToken,
  revokeTokens,
  setPassword,
} from "@/lib/auth/users";
import {
  createSession,
  currentUser,
  endAllSessions,
  endSession,
  pruneExpiredSessions,
  requireAdmin,
  requireScoped,
  SESSION_COOKIE,
  startSession,
  userForToken,
} from "@/lib/auth/session";
import { digest, isEmailShaped, normaliseEmail } from "@/lib/auth/tokens";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
} from "@/lib/auth/actions";
import { clearSentEmails, lastSentEmail } from "@/lib/email/send";
import { __clearCookies, __setCookie } from "../helpers/next-headers";
import { migrateTestDb } from "../helpers/db";

/** `redirect()` throws NEXT_REDIRECT on success; treat that as "succeeded". */
async function runAction(
  action: (prev: { error: string | null }, form: FormData) => Promise<unknown>,
  fields: Record<string, string>,
): Promise<{ redirected: boolean; error: string | null }> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  try {
    const result = (await action({ error: null }, form)) as {
      error: string | null;
    };
    return { redirected: false, error: result.error };
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      return { redirected: true, error: null };
    }
    throw e;
  }
}

describe("authentication", () => {
  beforeAll(async () => {
    await migrateTestDb();
  });

  beforeEach(() => {
    __clearCookies();
    clearSentEmails();
  });

  describe("password hashing", () => {
    it("round-trips a password and rejects a wrong one", async () => {
      const stored = await hashPassword("korrekt-häst-batteri");
      expect(await verifyPassword("korrekt-häst-batteri", stored)).toBe(true);
      expect(await verifyPassword("korrekt-häst-batteri ", stored)).toBe(false);
      expect(await verifyPassword("", stored)).toBe(false);
    });

    it("salts, so two hashes of the same password differ", async () => {
      const a = await hashPassword("samma-lösenord-här");
      const b = await hashPassword("samma-lösenord-här");
      expect(a).not.toBe(b);
      expect(await verifyPassword("samma-lösenord-här", b)).toBe(true);
    });

    it("stores parameters with the hash", async () => {
      const stored = await hashPassword("parametrar-i-strängen");
      const [scheme, n, r, p] = stored.split("$");
      expect(scheme).toBe("scrypt");
      expect([n, r, p]).toEqual(["16384", "8", "1"]);
    });

    it("never authenticates against a null or malformed record", async () => {
      expect(await verifyPassword("anything", null)).toBe(false);
      expect(await verifyPassword("anything", "")).toBe(false);
      expect(await verifyPassword("anything", "scrypt$1$2$3")).toBe(false);
      expect(await verifyPassword("anything", "bcrypt$1$1$1$aa$bb")).toBe(false);
      // A record whose stored key is empty must not match an empty derive.
      expect(await verifyPassword("anything", "scrypt$16384$8$1$YWJj$")).toBe(
        false,
      );
    });

    it("enforces a length floor before hashing", () => {
      expect(passwordProblem("kort")).toBe("too_short");
      expect(passwordProblem("a".repeat(201))).toBe("too_long");
      expect(passwordProblem("tillräckligt-långt")).toBeNull();
    });
  });

  describe("email handling", () => {
    it("normalises and validates", () => {
      expect(normaliseEmail("  Anna@Example.SE ")).toBe("anna@example.se");
      expect(isEmailShaped("anna@example.se")).toBe(true);
      expect(isEmailShaped("anna@example")).toBe(false);
      expect(isEmailShaped("anna example.se")).toBe(false);
      expect(isEmailShaped(`${"a".repeat(250)}@example.se`)).toBe(false);
    });

    it("finds an account case-insensitively", async () => {
      await createUser({ email: "Blandad@Exempel.se", password: "hemligt-nog-123" });
      expect((await findUserByEmail("blandad@exempel.se"))?.email).toBe(
        "blandad@exempel.se",
      );
      expect((await findUserByEmail("  BLANDAD@exempel.SE "))?.email).toBe(
        "blandad@exempel.se",
      );
    });
  });

  describe("sessions", () => {
    it("stores only a digest, never the token", async () => {
      const user = await createUser({
        email: "session@exempel.se",
        password: "hemligt-nog-123",
      });
      const token = await createSession(user.id);
      const rows = await db
        .select()
        .from(authSessions)
        .where(eq(authSessions.userId, user.id))
        .all();
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(digest(token));
      expect(rows[0].id).not.toBe(token);
    });

    it("resolves a valid token and rejects a tampered one", async () => {
      const user = await createUser({
        email: "resolve@exempel.se",
        password: "hemligt-nog-123",
      });
      const token = await createSession(user.id);
      expect((await userForToken(token))?.id).toBe(user.id);
      expect(await userForToken(`${token}x`)).toBeNull();
      expect(await userForToken("")).toBeNull();
    });

    it("rejects an expired session and prunes it", async () => {
      const user = await createUser({
        email: "expired@exempel.se",
        password: "hemligt-nog-123",
      });
      const token = await createSession(user.id);
      await db
        .update(authSessions)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(authSessions.id, digest(token)))
        .run();
      expect(await userForToken(token)).toBeNull();
      expect(await pruneExpiredSessions()).toBeGreaterThan(0);
    });

    it("signs in and out through the cookie", async () => {
      const user = await createUser({
        email: "cookie@exempel.se",
        password: "hemligt-nog-123",
      });
      await startSession(user.id);
      expect((await currentUser())?.email).toBe("cookie@exempel.se");
      await endSession();
      expect(await currentUser()).toBeNull();
    });

    it("revokes every device at once", async () => {
      const user = await createUser({
        email: "devices@exempel.se",
        password: "hemligt-nog-123",
      });
      const phone = await createSession(user.id);
      const laptop = await createSession(user.id);
      await endAllSessions(user.id);
      expect(await userForToken(phone)).toBeNull();
      expect(await userForToken(laptop)).toBeNull();
    });

    it("gives requireScoped an accessor bound to the signed-in account", async () => {
      const user = await createUser({
        email: "scoped@exempel.se",
        password: "hemligt-nog-123",
      });
      __setCookie(SESSION_COOKIE, await createSession(user.id));
      const { sdb } = await requireScoped();
      expect(sdb.userId).toBe(user.id);
    });

    it("refuses admin work to a plain account", async () => {
      const user = await createUser({
        email: "plain@exempel.se",
        password: "hemligt-nog-123",
      });
      __setCookie(SESSION_COOKIE, await createSession(user.id));
      await expect(requireAdmin()).rejects.toThrow(/not authenticated/i);

      const admin = await createUser({
        email: "chef@exempel.se",
        password: "hemligt-nog-123",
        role: "admin",
      });
      __setCookie(SESSION_COOKIE, await createSession(admin.id));
      expect((await requireAdmin()).role).toBe("admin");
    });
  });

  describe("single-use tokens", () => {
    it("stores a digest and consumes exactly once", async () => {
      const user = await createUser({
        email: "token@exempel.se",
        password: "hemligt-nog-123",
      });
      const raw = await issueToken(user.id, "password_reset");
      const stored = await db
        .select()
        .from(authTokens)
        .where(eq(authTokens.id, digest(raw)))
        .get();
      expect(stored?.userId).toBe(user.id);

      expect((await consumeToken(raw, "password_reset"))?.id).toBe(user.id);
      expect(await consumeToken(raw, "password_reset")).toBeNull();
    });

    it("will not accept a token of the wrong kind or past its expiry", async () => {
      const user = await createUser({
        email: "kind@exempel.se",
        password: "hemligt-nog-123",
      });
      const raw = await issueToken(user.id, "password_reset");
      expect(await consumeToken(raw, "magic_link")).toBeNull();

      const stale = await issueToken(user.id, "password_reset");
      await db
        .update(authTokens)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(authTokens.id, digest(stale)))
        .run();
      expect(await consumeToken(stale, "password_reset")).toBeNull();
    });

    it("revokes outstanding tokens on demand", async () => {
      const user = await createUser({
        email: "revoke@exempel.se",
        password: "hemligt-nog-123",
      });
      const raw = await issueToken(user.id, "password_reset");
      await revokeTokens(user.id, "password_reset");
      expect(await consumeToken(raw, "password_reset")).toBeNull();
    });
  });

  describe("password reset, end to end", () => {
    it("mails a working link, rotates the password, and kills old sessions", async () => {
      const user = await createUser({
        email: "glomsk@exempel.se",
        password: "gammalt-losenord-1",
      });
      const oldSession = await createSession(user.id);

      const requested = await runAction(requestPasswordResetAction, {
        email: "glomsk@exempel.se",
      });
      expect(requested.error).toBeNull();

      const mail = lastSentEmail("glomsk@exempel.se");
      expect(mail?.subject).toContain("Återställ");
      const token = mail?.text.match(/reset-password\?token=([^\s]+)/)?.[1];
      expect(token).toBeTruthy();

      const reset = await runAction(resetPasswordAction, {
        token: decodeURIComponent(token as string),
        password: "nytt-losenord-2026",
      });
      expect(reset.redirected).toBe(true);

      const after = await findUserByEmail("glomsk@exempel.se");
      expect(await verifyPassword("nytt-losenord-2026", after!.passwordHash)).toBe(
        true,
      );
      expect(await verifyPassword("gammalt-losenord-1", after!.passwordHash)).toBe(
        false,
      );
      // Every session that existed before the reset is gone.
      expect(await userForToken(oldSession)).toBeNull();
    });

    it("says nothing about whether an address has an account", async () => {
      const result = await runAction(requestPasswordResetAction, {
        email: "finns-inte@exempel.se",
      });
      expect(result.error).toBeNull();
      expect(lastSentEmail("finns-inte@exempel.se")).toBeNull();
    });

    it("rejects a reused reset link", async () => {
      const user = await createUser({
        email: "aterbruk@exempel.se",
        password: "gammalt-losenord-1",
      });
      const raw = await issueToken(user.id, "password_reset");
      const first = await runAction(resetPasswordAction, {
        token: raw,
        password: "forsta-nya-losenordet",
      });
      expect(first.redirected).toBe(true);
      const second = await runAction(resetPasswordAction, {
        token: raw,
        password: "andra-nya-losenordet",
      });
      expect(second.error).toBe("token_invalid");
    });
  });

  describe("sign-in", () => {
    it("gives one message for a wrong password and an unknown address", async () => {
      await createUser({
        email: "finns@exempel.se",
        password: "ratt-losenord-123",
      });
      const wrongPassword = await runAction(signInAction, {
        email: "finns@exempel.se",
        password: "fel-losenord-123",
      });
      const unknownAddress = await runAction(signInAction, {
        email: "okand@exempel.se",
        password: "ratt-losenord-123",
      });
      expect(wrongPassword.error).toBe("credentials_invalid");
      expect(unknownAddress.error).toBe(wrongPassword.error);
    });

    it("refuses an account that has no password (Google-only)", async () => {
      const user = await createUser({ email: "google@exempel.se" });
      expect(user.passwordHash).toBeNull();
      const attempt = await runAction(signInAction, {
        email: "google@exempel.se",
        password: "vilket-som-helst-1",
      });
      expect(attempt.error).toBe("credentials_invalid");
    });

    it("signs in with the right password", async () => {
      await createUser({
        email: "lyckad@exempel.se",
        password: "ratt-losenord-123",
      });
      const ok = await runAction(signInAction, {
        email: "lyckad@exempel.se",
        password: "ratt-losenord-123",
      });
      expect(ok.redirected).toBe(true);
      expect((await currentUser())?.email).toBe("lyckad@exempel.se");
    });

    it("refuses to sign in as an account whose password was changed", async () => {
      const user = await createUser({
        email: "rotera@exempel.se",
        password: "forsta-losenordet-1",
      });
      await setPassword(user.id, "andra-losenordet-22");
      expect(
        (
          await runAction(signInAction, {
            email: "rotera@exempel.se",
            password: "forsta-losenordet-1",
          })
        ).error,
      ).toBe("credentials_invalid");
    });
  });

  it("keeps the users table free of plaintext", async () => {
    const rows = await db.select().from(users).all();
    expect(rows.length).toBeGreaterThan(5);
    for (const row of rows) {
      if (row.passwordHash) expect(row.passwordHash).toMatch(/^scrypt\$/);
    }
  });
});
