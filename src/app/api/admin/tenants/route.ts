import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ tenants });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body?.name as string | undefined)?.trim();
  const email = (body?.email as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existingTenant = await prisma.tenant.findFirst({ where: { name } });
  if (existingTenant) {
    return NextResponse.json({ error: "Tenant name already exists" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const tenant = await prisma.tenant.create({
    data: { name, isActive: true },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: `${name} Admin`,
      email,
      passwordHash,
      role: "tenant_admin",
      tenantId: tenant.id,
      isActive: true,
      isBarber: true,
    },
  });

  return NextResponse.json({ ok: true, tenant });
}
