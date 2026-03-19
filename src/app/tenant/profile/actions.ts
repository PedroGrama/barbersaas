"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string, email?: string, logoUrl?: string }) {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autorizado");

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;

  if (updateData.name || updateData.email) {
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
  }

  // Se for admin e tiver logoUrl, atualiza o tenant
  if ((user.role === "tenant_admin" || user.role === "admin_geral") && data.logoUrl && user.tenantId) {
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { logoUrl: data.logoUrl }
    });
  }

  revalidatePath("/tenant/profile");
  return { success: true };
}

export async function updatePassword(currentPassword?: string, newPassword?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser || !currentUser.passwordHash) throw new Error("Usuário não encontrado");

  // Verificar senha atual
  if (currentPassword) {
    const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
    if (!isValid) throw new Error("Senha atual incorreta");
  } else {
    throw new Error("Senha atual obrigatória");
  }

  if (newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
  } else {
    throw new Error("Nova senha obrigatória");
  }

  return { success: true };
}
