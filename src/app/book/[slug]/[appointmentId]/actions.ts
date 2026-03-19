"use server";

import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function doCheckIn(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  
  if (!appointment) throw new Error("Agendamento não encontrado.");
  if (appointment.clientConfirmedAt) throw new Error("Check-in já foi realizado.");
  if (appointment.status === "cancelled") throw new Error("Não é possível fazer check-in em um horário cancelado.");

  const now = new Date();
  const scheduledStart = appointment.scheduledStart;
  const diffMinutes = (scheduledStart.getTime() - now.getTime()) / 60000;

  if (diffMinutes > 30) {
    throw new Error("O check-in só é liberado 30 minutos antes.");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { clientConfirmedAt: now }
  });

  revalidatePath(`/book/`);
}
