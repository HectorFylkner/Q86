/**
 * Account maintenance from the terminal.
 *
 *   pnpm claim-owner --email=you@example.com --password='…'
 *     Attaches credentials to the legacy owner account that the
 *     multi-tenancy migration created, so a single-user install's history
 *     becomes a real, signed-in account. Idempotent: run it again to
 *     change the address or reset the password.
 *
 *   pnpm dev-account [--email=…] [--password=…]
 *     Seeds a development account against the same multi-tenant schema
 *     production uses. Refused when NODE_ENV is production.
 */
import { eq } from "drizzle-orm";
import { ensureDbReady } from "../lib/db/bootstrap.ts";
import { db } from "../lib/db/index.ts";
import { users } from "../lib/db/schema.ts";
import { hashPassword, passwordProblem } from "../lib/auth/password.ts";
import { isEmailShaped, newUserId, normaliseEmail } from "../lib/auth/tokens.ts";

const LEGACY_OWNER_ID = "usr_legacy_owner";

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

function die(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

async function upsert(input: {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  label: string;
}): Promise<void> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, input.id))
    .get();
  const passwordHash = await hashPassword(input.password);

  if (existing) {
    await db
      .update(users)
      .set({
        email: input.email,
        passwordHash,
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.id))
      .run();
    console.log(`\n  ${input.label} updated: ${input.email}\n`);
    return;
  }

  const clash = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .get();
  if (clash) {
    die(
      `Another account already uses ${input.email} (id ${clash.id}). ` +
        "Pick a different address.",
    );
  }

  await db
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      passwordHash,
      emailVerifiedAt: new Date(),
      role: input.role,
      locale: "sv",
    })
    .run();
  console.log(`\n  ${input.label} created: ${input.email}\n`);
}

async function main(): Promise<void> {
  const mode = process.argv.includes("--dev") ? "dev" : "claim";
  await ensureDbReady();

  if (mode === "dev") {
    if (process.env.NODE_ENV === "production") {
      die("dev-account refuses to run with NODE_ENV=production.");
    }
    const email = normaliseEmail(arg("email") ?? "dev@q86.local");
    const password = arg("password") ?? "utveckling-lokalt";
    await upsert({
      id: "usr_dev_account",
      email,
      password,
      role: "admin",
      label: "Development account",
    });
    console.log(`  Password: ${password}`);
    console.log("  Local development runs the same multi-tenant schema as");
    console.log("  production; this account is simply its first tenant.\n");
    return;
  }

  const email = arg("email");
  const password = arg("password");
  if (!email || !isEmailShaped(email)) {
    die("Usage: pnpm claim-owner --email=you@example.com --password='…'");
  }
  const problem = password ? passwordProblem(password) : "missing";
  if (problem) {
    die(
      problem === "missing"
        ? "A --password is required."
        : `Password rejected: ${problem.replace("_", " ")}.`,
    );
  }

  const legacy = await db
    .select()
    .from(users)
    .where(eq(users.id, LEGACY_OWNER_ID))
    .get();
  if (!legacy) {
    // No legacy owner means the database had no pre-tenancy data. Making a
    // fresh admin is still the useful thing to do here.
    await upsert({
      id: newUserId(),
      email: normaliseEmail(email),
      password: password as string,
      role: "admin",
      label: "Admin account (no legacy data found)",
    });
    return;
  }

  await upsert({
    id: LEGACY_OWNER_ID,
    email: normaliseEmail(email),
    password: password as string,
    role: "admin",
    label: "Legacy owner claimed",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
