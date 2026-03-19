"use server";

import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) throw new Error("Campos obrigatórios faltando.");
  if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
  if (password.length < 6) throw new Error("A senha deve ter no mínimo 6 caracteres.");

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  
  if (!resetToken) throw new Error("Token inválido ou inexistente.");
  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    throw new Error("Este link de recuperação expirou.");
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { passwordHash: hash }
  });

  // Burn token after use
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
}
