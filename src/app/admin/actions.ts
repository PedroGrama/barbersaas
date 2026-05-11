"use server";

import { getSessionUser, setSessionCookie } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LicencaTipo, TenantStatus } from "@prisma/client";

export async function impersonateTenant(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const user = await getSessionUser();

  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  // Update session with the new tenantId
  await setSessionCookie({ 
    ...user, 
    tenantId 
  });
  
  redirect("/tenant");
}

export async function updateTenantBilling(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  const tenantId = formData.get("tenantId") as string;
  const taxaServicoPct = Number(formData.get("taxaServicoPct"));
  const mensalidadeValor = Number(formData.get("mensalidadeValor"));
  const licencaTipo = formData.get("licencaTipo") as LicencaTipo;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { 
      taxaServicoPct, 
      mensalidadeValor,
      licencaTipo
    }
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath("/admin");
}

export async function updateTenantStatus(tenantId: string, isActive: boolean) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") {
    throw new Error("Não autorizado");
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { 
      isActive, 
      status: isActive ? TenantStatus.ATIVO : TenantStatus.SUSPENSO 
    }
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath("/admin");
}
