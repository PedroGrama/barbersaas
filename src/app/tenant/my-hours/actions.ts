"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function saveMyHours(tenantId: string, hours: any[]) {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) throw new Error("Unauthorized");

  const barberId = user.id;

  await prisma.barberBusinessHour.deleteMany({ where: { barberId } });
  await prisma.barberBusinessHour.createMany({
    data: hours.map(h => ({
      tenantId,
      barberId,
      weekday: h.weekday,
      startTime: h.startTime || "09:00",
      endTime: h.endTime || "18:00",
      breakStart: h.breakStart || null,
      breakEnd: h.breakEnd || null,
      isClosed: h.isClosed,
    }))
  });
  
  revalidatePath("/tenant/my-hours");
}
