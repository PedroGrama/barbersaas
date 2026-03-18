import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth";

export async function POST(request: Request) {
  await clearSessionCookie();
  // Redirect to login after clearing the cookie.
  return NextResponse.redirect(new URL("/login", request.url));
}

