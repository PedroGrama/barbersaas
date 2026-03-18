import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { setSessionCookie } from "@/server/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setSessionCookie({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId ?? null,
    name: user.name,
    email: user.email,
    isBarber: user.isBarber,
  });

  return NextResponse.json({ ok: true });
}

