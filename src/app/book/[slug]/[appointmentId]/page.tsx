import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { TrackerClient } from "./TrackerClient";

export default async function AppointmentTrackingPage({ params }: { params: Promise<{ slug: string, appointmentId: string }> }) {
  const { slug, appointmentId } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      tenant: true,
      barber: true,
      items: { include: { service: true } }
    }
  });

  if (!appointment || appointment.tenant.slug !== slug) return notFound();

  const apptData = {
    id: appointment.id,
    scheduledStart: appointment.scheduledStart.toISOString(),
    status: appointment.status,
    checkedIn: !!appointment.clientConfirmedAt,
    tenantName: appointment.tenant.name,
    barberName: appointment.barber.name,
    totalPrice: Number(appointment.pricingFinal),
    checkinMinutes: appointment.tenant.checkinMinutes
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 md:p-8 flex items-center justify-center">
      <TrackerClient appointment={apptData} slug={slug} />
    </div>
  );
}
