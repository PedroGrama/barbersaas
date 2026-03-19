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
  const allowChooseBarber = formData.get("allowChooseBarber") === "on";

  if (!name || !slug) throw new Error("Nome e URL são obrigatórios.");

  // Check unique slug validation
  const existingSlug = await prisma.tenant.findFirst({
    where: { slug, id: { not: tenantId } }
  });

  if (existingSlug) {
    throw new Error("Esta URL/slug já está em uso por outra barbearia.");
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { name, slug, logoUrl, pixKey, allowChooseBarber }
  });

  revalidatePath("/tenant/settings");
}
