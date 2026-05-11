import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

function timeToMins(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const dateNum = searchParams.get("date"); // YYYY-MM-DD
  const inputBarberId = searchParams.get("barberId");

  if (!tenantId || !dateNum) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const [y, mo, d] = dateNum.split('-').map(Number);
  const localDate = new Date(y, mo - 1, d);
  const weekday = localDate.getDay();

  const startOfDay = new Date(`${dateNum}T00:00:00`);
  const endOfDay = new Date(`${dateNum}T23:59:59`);

  const tenantHour = await prisma.tenantBusinessHour.findFirst({ where: { tenantId, weekday } });
  
  const barbers = await prisma.user.findMany({
    where: { 
      tenantId, 
      isBarber: true, 
      isActive: true, 
      deletedAt: null,
      ...(inputBarberId ? { id: inputBarberId } : {})
    }
  });

  const barberHours = await prisma.barberBusinessHour.findMany({
    where: { tenantId, weekday, barberId: { in: barbers.map(b => b.id) } }
  });

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      scheduledStart: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ["cancelled", "no_show"] },
      barberId: { in: barbers.map(b => b.id) }
    },
    select: { scheduledStart: true, scheduledEnd: true, barberId: true }
  });

  const bookedSlots: string[] = [];

  const tStart = timeToMins(tenantHour?.startTime || "00:00")!;
  const tEnd = timeToMins(tenantHour?.endTime || "23:59")!;
  const tBreakS = timeToMins(tenantHour?.breakStart || null);
  const tBreakE = timeToMins(tenantHour?.breakEnd || null);

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const slotMins = h * 60 + m;
      let slotAvailable = false;

      // Check tenant hours availability
      if (tenantHour && !tenantHour.isClosed) {
        if (slotMins >= tStart && slotMins < tEnd) {
          if (tBreakS === null || tBreakE === null || slotMins < tBreakS || slotMins >= tBreakE) {
            
            // Look for AT LEAST ONE barber available
            for (const barber of barbers) {
              const bh = barberHours.find(x => x.barberId === barber.id);
              if (bh && !bh.isClosed) {
                const bStart = timeToMins(bh.startTime)!;
                const bEnd = timeToMins(bh.endTime)!;
                const bBreakS = timeToMins(bh.breakStart);
                const bBreakE = timeToMins(bh.breakEnd);

                if (slotMins >= bStart && slotMins < bEnd) {
                  if (bBreakS === null || bBreakE === null || slotMins < bBreakS || slotMins >= bBreakE) {
                    
                    // Check overlapping appointments for this barber
                    const overlaps = appointments.some(app => {
                      if (app.barberId !== barber.id) return false;
                      const aStart = app.scheduledStart.getHours() * 60 + app.scheduledStart.getMinutes();
                      const aEnd = app.scheduledEnd.getHours() * 60 + app.scheduledEnd.getMinutes();
                      return slotMins >= aStart && slotMins < aEnd;
                    });

                    if (!overlaps) {
                      slotAvailable = true;
                      break; // We found at least one barber capable of accepting the booking
                    }
                  }
                }
              }
            }

          }
        }
      }

      if (!slotAvailable) {
         bookedSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
  }

  return NextResponse.json([...new Set(bookedSlots)]);
}
