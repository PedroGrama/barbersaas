"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

async function verifyAdminAccess() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) throw new Error("Unauthorized");
  return user;
}

export async function addService(data: { name: string, basePrice: number, durationMinutes: number }) {
  const admin = await verifyAdminAccess();
  
  const tenant = await prisma.tenant.findUnique({ 
    where: { id: admin.tenantId! },
    select: { licencaTipo: true }
  });
  if (tenant?.licencaTipo === "TESTE_GRATIS") {
    const serviceCount = await prisma.service.count({ where: { tenantId: admin.tenantId!, isActive: true } });
    if (serviceCount >= 3) {
      throw new Error("Limite de 3 serviços atingido no plano Teste Grátis. Faça o upgrade para adicionar mais!");
    }
  }

  await prisma.service.create({
    data: {
      tenantId: admin.tenantId!,
      name: data.name,
      basePrice: data.basePrice,
      durationMinutes: data.durationMinutes,
      isActive: true,
    }
  });
  
  revalidatePath("/tenant/services");
}

export async function updateService(serviceId: string, newPrice: number, newDuration: number) {
  const admin = await verifyAdminAccess();
  
  // Confirma se o serviço pertence ao tenant
  await prisma.service.update({
    where: { id: serviceId, tenantId: admin.tenantId! },
    data: { basePrice: newPrice, durationMinutes: newDuration }
  });
  
  revalidatePath("/tenant/services");
}

export async function deleteService(serviceId: string) {
  const admin = await verifyAdminAccess();
  
  // Para evitar quebrar históricos de agendamentos, usamos soft delete inativando o serviço.
  await prisma.service.update({
    where: { id: serviceId, tenantId: admin.tenantId! },
    data: { isActive: false }
  });
  
  revalidatePath("/tenant/services");
}
