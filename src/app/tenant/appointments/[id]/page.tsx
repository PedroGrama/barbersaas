import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { AppointmentWorkflow } from "./AppointmentWorkflow";

export default async function AppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id: resolvedParams.id, tenantId: user.tenantId },
    include: {
      client: true,
      barber: true,
      items: {
        include: { service: true }
      }
    }
  });

  if (!appointment) return notFound();

  // Load tenant services for the Review Screen
  const services = await prisma.service.findMany({
    where: { tenantId: user.tenantId, isActive: true }
  });

  // Load Pix Key
  const pixKey = await prisma.pixKey.findFirst({
    where: { tenantId: user.tenantId, isActive: true }
  });

  // Load today's queue for this barber
  const startOfDay = new Date(appointment.scheduledStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointment.scheduledStart);
  endOfDay.setHours(23, 59, 59, 999);

  const queue = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      barberId: appointment.barberId,
      scheduledStart: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ["cancelled", "done", "no_show"] }
    },
    orderBy: { scheduledStart: "asc" },
    include: { client: true }
  });

  // Serialize Decimal to Number for Client Components
  const serializedAppointment = {
    ...appointment,
    pricingOriginal: Number(appointment.pricingOriginal),
    discountApplied: Number(appointment.discountApplied),
    pricingFinal: Number(appointment.pricingFinal),
    items: appointment.items.map(item => ({
      ...item,
      unitPriceSnapshot: Number(item.unitPriceSnapshot),
      service: item.service ? {
        ...item.service,
        basePrice: Number(item.service.basePrice)
      } : null
    }))
  };

  const serializedServices = services.map(s => ({
    ...s,
    basePrice: Number(s.basePrice)
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Detalhes de Agendamentos</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <h2 className="text-sm text-zinc-500 uppercase font-semibold tracking-wider mb-4">Informações</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-zinc-500">Cliente</span>
                <span className="font-medium">{appointment.client.name}</span>
                <span className="block text-xs text-zinc-400">{appointment.client.phone}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Data e Hora</span>
                <span className="font-medium">
                  {appointment.scheduledStart.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', hour12: false })}
                </span>
              </div>
              <div>
                <span className="block text-zinc-500">Barbeiro</span>
                <span className="font-medium">{appointment.barber.name}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Status</span>
                <span className="font-bold uppercase tracking-wider">{appointment.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <h2 className="text-sm text-zinc-500 uppercase font-semibold tracking-wider mb-4">Agenda do Profissional (Hoje)</h2>
            <div className="space-y-3">
              {queue.map(q => {
                 const isCurrent = q.id === appointment.id;
                 let badge = "Pré-agendado";
                 if (q.status === "in_progress") badge = "Em atendimento";
                 else if (q.status === "awaiting_payment") badge = "Recebimento";
                 else if (q.status === "confirmed" && q.clientConfirmedAt) badge = "Aguardando (Check-in)";
                 else if (q.status === "confirmed" && new Date() >= q.scheduledStart) badge = "Atrasado";

                 return (
                   <div key={q.id} className={`flex items-center justify-between p-3 rounded-xl border ${isCurrent ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-zinc-100 dark:border-zinc-800'}`}>
                     <div>
                       <div className={`text-sm font-bold truncate ${isCurrent ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                         {q.client.name}
                       </div>
                       <div className="text-xs font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
                         {q.scheduledStart.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
                       </div>
                     </div>
                     <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-md max-w-[100px] text-center ${
                       badge === 'Atrasado' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                       badge === 'Aguardando (Check-in)' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                       isCurrent ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/30' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                     }`}>
                       {badge}
                     </span>
                   </div>
                 );
              })}
              {queue.length === 0 && (
                <div className="text-xs font-medium text-zinc-500 text-center py-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">Fila vazia hoje para este profissional.</div>
              )}
            </div>
          </div>

          <a href="/tenant" className="block text-center w-full rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700">
            Voltar para Agenda
          </a>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-2xl shadow-sm min-h-[400px]">
             <AppointmentWorkflow 
               appointment={serializedAppointment} 
               tenantServices={serializedServices} 
               pixKey={pixKey}
               currentUserId={user.id}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
