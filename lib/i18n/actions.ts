"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { currentUser } from "../auth/session.ts";
import { setLocale as persistLocale } from "../auth/users.ts";
import { LOCALE_COOKIE } from "./locale.ts";
import { isLocale, type Locale } from "./types.ts";

/**
 * Switching language. The cookie is always set, so the choice survives on
 * the public site before signup; when there is an account, the choice is
 * written to it as well, so it follows the reader to another device
 * (ADR 0004).
 */
export async function setLocaleAction(next: string): Promise<void> {
  if (!isLocale(next)) return;
  const locale: Locale = next;

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 400 * 24 * 60 * 60,
  });

  const user = await currentUser();
  if (user) await persistLocale(user.id, locale);

  revalidatePath("/", "layout");
}
