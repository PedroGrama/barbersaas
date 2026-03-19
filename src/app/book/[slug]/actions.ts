"use server";

import { prisma } from "@/server/db";

export async function createPublicAppointment(data: {
  tenantId: string,
  clientName: string,
  clientPhone: string,
  dateStr: string, // "YYYY-MM-DD"
  timeStr: string, // "HH:MM"
  barberId: string | null,
  serviceIds: string[]
}) {
  const { tenantId, clientName, clientPhone, dateStr, timeStr, serviceIds } = data;
  let barberId = data.barberId;

  // 1. Get Services to calculate total time and price
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, tenantId }
  });

  if (services.length !== serviceIds.length) {
    throw new Error("Alguns serviços selecionados não estão disponíveis.");
  }

  const totalDurationMinutes = services.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPrice = services.reduce((acc, s) => acc + Number(s.basePrice), 0);

  // Parse Date
  const scheduledStart = new Date(`${dateStr}T${timeStr}:00`);
  const scheduledEnd = new Date(scheduledStart.getTime() + totalDurationMinutes * 60000);

  // 2. Round-Robin (Equitable Distribution) if barberId is null
  if (!barberId) {
    // Pegar todos os barbeiros ativos
    const barbers = await prisma.user.findMany({
      where: { tenantId, isBarber: true, isActive: true, deletedAt: null }
    });

    if (barbers.length === 0) throw new Error("Não há barbeiros disponíveis nesta barbearia.");

    // Encontrar o barbeiro com menos agendamentos no dia
    // Para simplificar, faremos uma contagem
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const appointmentCounts = await prisma.appointment.groupBy({
      by: ['barberId'],
      where: {
        tenantId,
        scheduledStart: { gte: startOfDay, lte: endOfDay },
        status: { not: "cancelled" }
      },
      _count: true
    });

    const countMap = new Map(appointmentCounts.map(a => [a.barberId, a._count]));

    // Ordenar barbeiros pela quantidade (crescente)
    barbers.sort((a, b) => (countMap.get(a.id) || 0) - (countMap.get(b.id) || 0));

    barberId = barbers[0].id; // O primeiro tem menos
  }

  // 2.5 Validation: Business Hours
  const weekday = scheduledStart.getDay();
  const startTimeMins = scheduledStart.getHours() * 60 + scheduledStart.getMinutes();
  const endTimeMins = startTimeMins + totalDurationMinutes;

  function timeToMins(t: string | null) {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  const tenantHour = await prisma.tenantBusinessHour.findFirst({ where: { tenantId, weekday } });
  if (!tenantHour || tenantHour.isClosed) throw new Error("A barbearia está fechada neste dia.");
  
  const bShopStart = timeToMins(tenantHour.startTime)!;
  const bShopEnd = timeToMins(tenantHour.endTime)!;
  if (startTimeMins < bShopStart || endTimeMins > bShopEnd) {
    throw new Error(`A barbearia funciona apenas de ${tenantHour.startTime} às ${tenantHour.endTime} neste dia.`);
  }
  
  const tBreakStart = timeToMins(tenantHour.breakStart);
  const tBreakEnd = timeToMins(tenantHour.breakEnd);
  if (tBreakStart !== null && tBreakEnd !== null) {
    if (
      (startTimeMins >= tBreakStart && startTimeMins < tBreakEnd) ||
      (endTimeMins > tBreakStart && endTimeMins <= tBreakEnd) ||
      (startTimeMins <= tBreakStart && endTimeMins >= tBreakEnd)
    ) {
      throw new Error(`Este horário conflita com o horário de pausa da barbearia (${tenantHour.breakStart} às ${tenantHour.breakEnd}).`);
    }
  }

  const barberHour = await prisma.barberBusinessHour.findFirst({ where: { tenantId, barberId, weekday } });
  if (!barberHour || barberHour.isClosed) throw new Error("O barbeiro não atende neste dia.");

  const bBarbStart = timeToMins(barberHour.startTime)!;
  const bBarbEnd = timeToMins(barberHour.endTime)!;
  if (startTimeMins < bBarbStart || endTimeMins > bBarbEnd) {
    throw new Error(`O barbeiro atende apenas de ${barberHour.startTime} às ${barberHour.endTime} neste dia.`);
  }

  const bBreakStart = timeToMins(barberHour.breakStart);
  const bBreakEnd = timeToMins(barberHour.breakEnd);
  if (bBreakStart !== null && bBreakEnd !== null) {
    if (
      (startTimeMins >= bBreakStart && startTimeMins < bBreakEnd) ||
      (endTimeMins > bBreakStart && endTimeMins <= bBreakEnd) ||
      (startTimeMins <= bBreakStart && endTimeMins >= bBreakEnd)
    ) {
      throw new Error(`Este horário conflita com a pausa do barbeiro (${barberHour.breakStart} às ${barberHour.breakEnd}).`);
    }
  }

  // Verificar se há conflito para o barbeiro selecionado
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
    throw new Error("Este horário já foi reservado. Por favor, escolha outro ou não selecione um barbeiro para que busquemos um disponível.");
  }

  // 3. Find or Create Client
  // Assume we have a Client model. Let's try finding by phone.
  let client = await prisma.client.findFirst({ where: { tenantId, phone: clientPhone } });
  if (!client) {
    client = await prisma.client.create({
      data: { tenantId, name: clientName, phone: clientPhone }
    });
  }

  // 4. Create Appointment and Items
  const appointmentId = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        tenantId,
        clientId: client.id,
        barberId: barberId as string,
        scheduledStart,
        scheduledEnd,
        origin: "app",
        status: "confirmed", // Confirmed since it's online
        pricingOriginal: totalPrice,
        discountApplied: 0,
        pricingFinal: totalPrice,
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
      // For online booking, the client created it but addedByUserId needs a string. 
      // We can use the barberId since they'll be responsible for it.
      addedByUserId: barberId as string 
    }));

    await tx.appointmentItem.createMany({ data: itemsData });
    
    return appt.id;
  });

  return appointmentId;
}
