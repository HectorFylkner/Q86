"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session.ts";
import { referralCodeFor } from "./grants.ts";
import { revokeShareCode, shareCodeFor } from "./share.ts";

/**
 * The two things an account can ask for on its own behalf: a referral code
 * and a share link. Both mint on first request rather than at signup, so
 * an account that never asks never has one to leak.
 */

export async function issueReferralCodeAction(): Promise<string> {
  const user = await requireUser();
  const code = await referralCodeFor(user.id);
  revalidatePath("/konto");
  return code;
}

export async function issueShareCodeAction(): Promise<string> {
  const user = await requireUser();
  const code = await shareCodeFor(user.id);
  revalidatePath("/konto");
  return code;
}

/** Rotating to null is the only real undo for something already posted. */
export async function revokeShareCodeAction(): Promise<void> {
  const user = await requireUser();
  await revokeShareCode(user.id);
  revalidatePath("/konto");
}
