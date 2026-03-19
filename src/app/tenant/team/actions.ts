"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function verifyAdminAccess() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) throw new Error("Unauthorized");
  return user;
}

export async function toggleMemberActive(memberId: string, current: boolean) {
  const admin = await verifyAdminAccess();
  
  await prisma.user.update({
    where: { id: memberId, tenantId: admin.tenantId! },
    data: { isActive: !current }
  });
  revalidatePath("/tenant/team");
}

export async function toggleIsBarber(memberId: string, current: boolean) {
  const admin = await verifyAdminAccess();
  
  await prisma.user.update({
    where: { id: memberId, tenantId: admin.tenantId! },
    data: { isBarber: !current }
  });
  revalidatePath("/tenant/team");
}

export async function deleteMember(memberId: string) {
  const admin = await verifyAdminAccess();
  // Não permitir que o admin exclua a si mesmo
  if (admin.id === memberId) throw new Error("Você não pode excluir sua própria conta.");

  await prisma.user.update({
    where: { id: memberId, tenantId: admin.tenantId! },
    data: { isActive: false }
  });
  revalidatePath("/tenant/team");
}

export async function forceResetPassword(memberId: string, newPass: string) {
  const admin = await verifyAdminAccess();
  
  if (newPass.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres");

  const hash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { id: memberId, tenantId: admin.tenantId! },
    data: { passwordHash: hash }
  });
}

export async function editMember(memberId: string, name: string, email: string) {
  const admin = await verifyAdminAccess();
  
  await prisma.user.update({
    where: { id: memberId, tenantId: admin.tenantId! },
    data: { name, email }
  });
  revalidatePath("/tenant/team");
}

export async function promoteToAdmin(memberId: string) {
  const admin = await verifyAdminAccess();
  if (admin.role !== "tenant_admin" && admin.role !== "admin_geral") throw new Error("Apenas admins podem promover membros.");

  // Don't allow promoting yourself (you already are admin)
  if (admin.id === memberId) throw new Error("Você já é administrador.");

  const target = await prisma.user.findUnique({ where: { id: memberId } });
  if (!target || target.tenantId !== admin.tenantId) throw new Error("Membro não encontrado.");
  if (target.role === "tenant_admin" || target.role === "admin_geral") throw new Error("Este membro já é administrador.");

  await prisma.user.update({
    where: { id: memberId },
    data: { role: "tenant_admin", isBarber: true }
  });
  revalidatePath("/tenant/team");
}
