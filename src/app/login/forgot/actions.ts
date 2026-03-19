"use server";

import { prisma } from "@/server/db";
import { randomBytes } from "crypto";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) throw new Error("Email obrigatório");

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || user.deletedAt) {
    // Por segurança, não revelar que o usuário não existe.
    return;
  }

  // Generate secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora de validade

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt
    }
  });

  const resetLink = `http://localhost:3000/login/reset?token=${token}`;
  
  // Simulador de envio de e-mail (para o MVP)
  console.log("==========================================");
  console.log(`[SIMULADOR EMAIL] Recuperação de senha solicitada por: ${email}`);
  console.log(`[SIMULADOR EMAIL] Link gerado: ${resetLink}`);
  console.log("==========================================");
}
