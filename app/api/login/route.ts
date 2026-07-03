import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const presented = String(form.get("password") ?? "");
  const expected = process.env.SITE_PASSWORD ?? "";

  const ok =
    expected.length > 0 &&
    presented.length === expected.length &&
    timingSafeEqual(Buffer.from(presented), Buffer.from(expected));

  const response = NextResponse.redirect(
    new URL(ok ? "/" : "/login?error=1", request.url),
    303,
  );
  if (ok) {
    response.cookies.set(
      "q86_auth",
      createHash("sha256").update(expected).digest("hex"),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
      },
    );
  }
  return response;
}
