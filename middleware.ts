import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "barbersaas_session";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function readRole(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  if (!process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (payload as any)?.user?.role as string | undefined;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const protectedPrefixes = ["/admin", "/tenant"];
  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const role = await readRole(req);
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "admin_geral") {
    return NextResponse.redirect(new URL("/tenant", req.url));
  }

  if (pathname.startsWith("/tenant") && role === "admin_geral") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tenant/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

