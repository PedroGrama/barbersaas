"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function updateTenantSettings(formData: FormData) {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) {
    throw new Error("Unauthorized");
  }

  const tenantId = user.tenantId!; // admin_geral using impersonate updates the impersonated tenant

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const pixKey = formData.get("pixKey") as string;
  const allowChooseBarber = formData.get("allowChooseBarber") === "on" || formData.get("allowChooseBarber") === "true";
  
  const checkinMinutesStr = formData.get("checkinMinutes") as string;
  const checkinMinutes = parseInt(checkinMinutesStr, 10);

  if (!name || !slug) throw new Error("Nome e URL são obrigatórios.");
  if (isNaN(checkinMinutes) || checkinMinutes < 5 || checkinMinutes > 60) throw new Error("Tempo de check-in inválido (deve ser entre 5 e 60 minutos).");

  // Check unique slug validation
  const existingSlug = await prisma.tenant.findFirst({
    where: { slug, id: { not: tenantId } }
  });

  if (existingSlug) {
    throw new Error("Esta URL/slug já está em uso por outra barbearia.");
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { 
      name, 
      slug, 
      logoUrl, 
      pixKey, 
      allowChooseBarber,
      checkinMinutes
    }
  });

  revalidatePath("/tenant/settings");
}
