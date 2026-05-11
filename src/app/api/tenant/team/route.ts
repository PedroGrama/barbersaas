import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import bcrypt from "bcryptjs";
import { checkTenantBarberLimit } from "@/server/tenantLimits";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "tenant_admin" && user.role !== "admin_geral")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const { tenantId, name, email, password, role } = await req.json();

    if (!tenantId || !name || !email || !password) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    if (user.role === "tenant_admin" && user.tenantId !== tenantId) {
      return NextResponse.json({ error: "Acesso não autorizado ao estabelecimento" }, { status: 403 });
    }

    // Check limit for TESTE_GRATIS
    const limitCheck = await checkTenantBarberLimit(tenantId);
    if (!limitCheck.ok) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já está em uso" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newBarber = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        tenantId,
        role: role || "barbeiro",
        isBarber: true,
      },
    });

    const defaultHours = Array.from({ length: 7 }).map((_, i) => ({
      weekday: i,
      startTime: "09:00",
      endTime: "19:00",
      isClosed: i === 0, // Domingo fechado por padrão para novos barbeiros
    }));
    await prisma.barberBusinessHour.createMany({
      data: defaultHours.map(dh => ({ 
        ...dh, 
        tenantId, 
        barberId: newBarber.id,
        breakStart: null,
        breakEnd: null 
      })),
    });

    return NextResponse.json({ success: true, id: newBarber.id });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
