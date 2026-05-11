import { prisma } from "@/server/db";
import { LicencaTipo } from "@prisma/client";

export const LIMITS = {
  TESTE_GRATIS: {
    maxBarbers: 1,
    maxServices: 3,
  },
  // Other plans can be added here if needed in the future
};

export async function checkTenantBarberLimit(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { licencaTipo: true }
  });

  if (!tenant || tenant.licencaTipo !== LicencaTipo.TESTE_GRATIS) {
    return { ok: true };
  }

  const barberCount = await prisma.user.count({
    where: { tenantId, isBarber: true, deletedAt: null }
  });

  if (barberCount >= LIMITS.TESTE_GRATIS.maxBarbers) {
    return { 
      ok: false, 
      message: "Limite de profissionais atingido para o seu plano (Teste Grátis: 1). Atualize seu plano para adicionar mais." 
    };
  }

  return { ok: true };
}

export async function checkTenantServiceLimit(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { licencaTipo: true }
  });

  if (!tenant || tenant.licencaTipo !== LicencaTipo.TESTE_GRATIS) {
    return { ok: true };
  }

  const serviceCount = await prisma.service.count({
    where: { tenantId, isActive: true }
  });

  if (serviceCount >= LIMITS.TESTE_GRATIS.maxServices) {
    return { 
      ok: false, 
      message: "Limite de serviços atingido para o seu plano (Teste Grátis: 3). Atualize seu plano para adicionar mais." 
    };
  }

  return { ok: true };
}
