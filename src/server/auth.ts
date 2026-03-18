import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  role: "admin_geral" | "tenant_admin" | "barbeiro";
  tenantId: string | null;
  name: string;
  email: string;
  isBarber: boolean;
};

const SESSION_COOKIE = "barbersaas_session";

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment");
  }
  return secret;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requireJwtSecret());
}

export async function setSessionCookie(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const user = (payload as any)?.user as SessionUser | undefined;
    if (!user?.id || !user?.role) return null;
    return user;
  } catch {
    return null;
  }
}

