import { NextResponse, type NextRequest } from "next/server";
import { endSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST only: a GET logout link would let any page sign a user out. */
export async function POST(request: NextRequest) {
  await endSession();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
