"use server";

import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

export async function createWalkinAppointment(data: {
  tenantId: string,
  clientName: string,
  clientPhone: string,
  dateStr: string,
  timeStr: string,
  barberId: string,
  serviceIds: string[]
}) {
  const user = await getSessionUser();
  if (!user || user.tenantId !== data.tenantId) throw new Error("Acesso negado.");

  const { tenantId, clientName, clientPhone, dateStr, timeStr, serviceIds, barberId } = data;

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, tenantId }
  });

  const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = services.reduce((acc, s) => acc + Number(s.basePrice), 0);

  const scheduledStart = new Date(`${dateStr}T${timeStr}:00`);
  const scheduledEnd = new Date(scheduledStart.getTime() + totalDurationMinutes * 60000);

  // Regra SaaS: Não permitir novo agendamento se o profissional tiver um "Em Andamento" ou "Aguardando Pagamento"
  const pendingWork = await prisma.appointment.findFirst({
    where: {
      barberId,
      tenantId,
      status: { in: ["in_progress", "awaiting_payment"] }
    }
  });

  if (pendingWork) {
    throw new Error("Este profissional possui um atendimento em aberto. Conclua o anterior antes de iniciar um novo.");
  }

  // Validar se já existe horário no painel manual também
  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId,
      barberId,
      status: { not: "cancelled" },
      OR: [
        { scheduledStart: { lt: scheduledEnd }, scheduledEnd: { gt: scheduledStart } }
      ]
    }
  });

  if (conflict) {
    throw new Error("Conflito de horário! Este barbeiro já tem um agendamento neste período.");
  }

  // Achar ou criar client fake se não tiver telefone
  let client;
  if (clientPhone) {
    client = await prisma.client.findFirst({ where: { tenantId, phone: clientPhone } });
    if (!client) {
      client = await prisma.client.create({ data: { tenantId, name: clientName, phone: clientPhone } });
    }
  } else {
    client = await prisma.client.create({ data: { tenantId, name: clientName, phone: `SEM_FONE_${Date.now()}` } });
  }

  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        tenantId,
        clientId: client.id,
        barberId,
        scheduledStart,
        scheduledEnd,
        origin: "walk_in",
        status: "confirmed", // Confirmed since it's walkin/admin
        pricingOriginal: totalPrice,
        discountApplied: 0,
        pricingFinal: totalPrice,
        clientConfirmedAt: new Date(), // Walk-in já entra com check-in
      }
    });

    const itemsData = services.map(s => ({
      appointmentId: appt.id,
      tenantId,
      serviceId: s.id,
      nameSnapshot: s.name,
      durationMinutesSnapshot: s.durationMinutes,
      unitPriceSnapshot: s.basePrice,
      quantity: 1,
      addedByUserId: user.id
    }));

    await tx.appointmentItem.createMany({ data: itemsData });
  });

}
