"use server";

import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function saveTenantHours(tenantId: string, hours: any[]) {
  const user = await getSessionUser();
  if (!user || user.role === "barbeiro") throw new Error("Unauthorized");
  if (user.role === "tenant_admin" && user.tenantId !== tenantId) throw new Error("Unauthorized");

  await prisma.tenantBusinessHour.deleteMany({ where: { tenantId } });
  await prisma.tenantBusinessHour.createMany({
    data: hours.map(h => ({
      tenantId,
      weekday: h.weekday,
      startTime: h.startTime || "09:00",
      endTime: h.endTime || "18:00",
      breakStart: h.breakStart || null,
      breakEnd: h.breakEnd || null,
      isClosed: h.isClosed,
    }))
  });
  
  revalidatePath("/tenant/settings/hours");
}
