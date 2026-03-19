"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatus(id: string, status: any) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  await prisma.appointment.update({
    where: { id, tenantId: user.tenantId },
    data: { status }
  });
  
  revalidatePath(`/tenant`);
  revalidatePath(`/tenant/appointments/${id}`);
}

export async function finalizeReview(appointmentId: string, items: any[], finalTotal: number) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  // Remove os items antigos e insere os novos da revisão
  await prisma.$transaction(async (tx) => {
    await tx.appointmentItem.deleteMany({
      where: { appointmentId }
    });

    const newItems = items.map(i => ({
      appointmentId,
      tenantId: user.tenantId as string,
      serviceId: i.serviceId,
      nameSnapshot: i.nameSnapshot,
      durationMinutesSnapshot: i.durationMinutesSnapshot,
      unitPriceSnapshot: i.unitPriceSnapshot,
      quantity: 1,
      addedByUserId: user.id
    }));

    if (newItems.length > 0) {
      await tx.appointmentItem.createMany({ data: newItems });
    }

    await tx.appointment.update({
      where: { id: appointmentId, tenantId: user.tenantId as string },
      data: {
        status: "awaiting_payment",
        pricingFinal: finalTotal
      }
    });
  });

  revalidatePath(`/tenant/appointments/${appointmentId}`);
}

export async function registerPayment(appointmentId: string, methodStr: string, amount: number, pixKeyId?: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  // Prisma enums: PIX_DIRECT, CASH, MERCADO_PAGO_PIX, MERCADO_PAGO_CARD
  // AppointmentStatus: done

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        tenantId: user.tenantId as string,
        appointmentId,
        method: methodStr as any,
        status: "PAID",
        amount,
        pixKeyId: pixKeyId || null,
        paidAt: new Date(),
        createdByUserId: user.id
      }
    });

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "done" }
    });
  });

  revalidatePath(`/tenant/appointments/${appointmentId}`);
  revalidatePath(`/tenant`);
}

export async function repassAppointment(appointmentId: string) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) throw new Error("Acesso negado");

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.tenantId !== user.tenantId) throw new Error("Not found");

  const otherBarbers = await prisma.user.findMany({
    where: { tenantId: user.tenantId, isBarber: true, isActive: true, id: { not: appt.barberId } }
  });

  let selectedBarberId = null;
  for (const barber of otherBarbers) {
    const conflict = await prisma.appointment.findFirst({
      where: {
        tenantId: user.tenantId,
        barberId: barber.id,
        status: { not: "cancelled" },
        OR: [
          { scheduledStart: { lt: appt.scheduledEnd }, scheduledEnd: { gt: appt.scheduledStart } }
        ]
      }
    });
    
    // Simplification: We assume if there's no appointment conflict, we can repass.
    // In a fully strict system, we would also verify if the other barber's BusinessHours are open.
    if (!conflict) {
      selectedBarberId = barber.id;
      break;
    }
  }

  if (selectedBarberId) {
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { barberId: selectedBarberId }
    });
    revalidatePath(`/tenant`);
    revalidatePath(`/tenant/appointments/${appointmentId}`);
    return { repassed: true };
  } else {
    // Cancel it
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "cancelled" }
    });
    revalidatePath(`/tenant`);
    revalidatePath(`/tenant/appointments/${appointmentId}`);
    return { repassed: false };
  }
}
