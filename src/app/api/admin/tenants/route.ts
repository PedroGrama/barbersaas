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
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 });
  }

  const existingTenant = await prisma.tenant.findFirst({ where: { name } });
  if (existingTenant) {
    return NextResponse.json({ error: "Já existe um estabelecimento com este nome. Escolha um nome diferente." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Este email já está em uso. Utilize outro email para o admin deste estabelecimento." }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const tenant = await prisma.tenant.create({
    data: { name, slug, isActive: true },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = await prisma.user.create({
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

  const defaultHours = [
    { weekday: 0, startTime: "09:00", endTime: "13:00", breakStart: null, breakEnd: null },
    ...Array.from({ length: 6 }).map((_, i) => ({
      weekday: i + 1,
      startTime: "09:00",
      endTime: "19:00",
      breakStart: "13:00",
      breakEnd: "14:00",
    }))
  ];

  await prisma.tenantBusinessHour.createMany({
    data: defaultHours.map(dh => ({ ...dh, tenantId: tenant.id })),
  });
  await prisma.barberBusinessHour.createMany({
    data: defaultHours.map(dh => ({ ...dh, tenantId: tenant.id, barberId: adminUser.id })),
  });

   const defaultServices = [
    { name: "Corte de cabelo", basePrice: "40.00", durationMinutes: 30 },
    { name: "Barba", basePrice: "35.00", durationMinutes: 30 },
    { name: "Corte + Barba", basePrice: "70.00", durationMinutes: 60 },
    { name: "Pezinho", basePrice: "15.00", durationMinutes: 15 },
    { name: "Pigmentação de barba", basePrice: "30.00", durationMinutes: 30 },
    { name: "Hidratação capilar", basePrice: "40.00", durationMinutes: 30 },
    { name: "Relaxamento/alisamento", basePrice: "80.00", durationMinutes: 60 },
    { name: "Sobrancelha", basePrice: "20.00", durationMinutes: 15 },
    { name: "Limpeza de pele", basePrice: "50.00", durationMinutes: 30 },
    { name: "Depilação (cera/laser)", basePrice: "60.00", durationMinutes: 45 },
    { name: "Platinado/Descolorido", basePrice: "120.00", durationMinutes: 120 },
    { name: "Coloração", basePrice: "80.00", durationMinutes: 60 },
    { name: "Progressiva", basePrice: "150.00", durationMinutes: 90 },
  ];

  await prisma.service.createMany({
    data: defaultServices.map(s => ({ ...s, tenantId: tenant.id, isActive: true })),
  });

  return NextResponse.json({ ok: true, tenant });
}
