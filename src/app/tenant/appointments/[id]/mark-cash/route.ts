import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, tenantId: user.tenantId },
  });
  if (!appointment) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        tenantId: user.tenantId!,
        appointmentId: appointment.id,
        method: "CASH",
        status: "PAID",
        amount: appointment.pricingFinal,
        paidAt: new Date(),
        createdByUserId: user.id,
      },
    });
    await tx.appointment.update({
      where: { id: appointment.id },
      data: { status: "done" },
    });
  });

  return NextResponse.redirect(new URL(`/tenant/appointments/${appointment.id}`, req.url));
}

