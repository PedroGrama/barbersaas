import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { ReportsFilter } from "./ReportsFilter";

export default async function ReportsPage({ searchParams }: { searchParams: { start?: string, end?: string, barber?: string } }) {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");
  if (!user.tenantId) return <div className="p-6">Selecione uma barbearia.</div>;

  const isAdmin = user.role === "tenant_admin" || user.role === "admin_geral";

  // Calculate Dates
  const today = new Date();
  const startParam = searchParams.start ? new Date(searchParams.start) : new Date(today.getFullYear(), today.getMonth(), 1);
  const endParam = searchParams.end ? new Date(searchParams.end) : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Barber filter enforced
  const enforcedBarberId = isAdmin ? (searchParams.barber || undefined) : user.id;

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      status: "done", // Only completed services for financial report
      scheduledStart: { gte: startParam, lte: endParam },
      ...(enforcedBarberId ? { barberId: enforcedBarberId } : {})
    },
    include: { client: true, barber: true, payments: true },
    orderBy: { scheduledStart: "desc" }
  });

  const totalRevenue = appointments.reduce((acc, a) => acc + Number(a.pricingFinal), 0);
  const totalClients = new Set(appointments.map(a => a.clientId)).size;

  // Load barbers for filter
  const barbers = await prisma.user.findMany({
    where: { tenantId: user.tenantId, isBarber: true, deletedAt: null }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Relatórios e Faturamento</h1>
      <p className="text-sm text-zinc-500">Visualize métricas baseadas apenas em agendamentos concluídos (status: done).</p>

      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <ReportsFilter 
          currentStart={startParam.toISOString().split('T')[0]} 
          currentEnd={endParam.toISOString().split('T')[0]} 
          currentBarber={enforcedBarberId || ""}
          barbers={barbers}
          isAdmin={isAdmin}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="text-sm font-medium opacity-80 mb-1">Faturamento Bruto</div>
          <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-2xl p-4">
          <div className="text-sm font-medium opacity-80 mb-1">Serviços Feitos</div>
          <div className="text-2xl font-bold">{appointments.length}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
          <div className="text-sm font-medium opacity-80 mb-1">Clientes Únicos</div>
          <div className="text-2xl font-bold">{totalClients}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950 border-b dark:border-zinc-800 text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              {isAdmin && <th className="px-5 py-3 font-medium">Barbeiro</th>}
              <th className="px-5 py-3 font-medium text-right">Faturamento</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {appointments.map(a => (
              <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-5 py-3">{a.scheduledStart.toLocaleDateString()} {a.scheduledStart.toLocaleTimeString().slice(0, 5)}</td>
                <td className="px-5 py-3 font-medium dark:text-zinc-50">{a.client.name} {a.client.phone && <span className="text-xs text-zinc-400 font-normal ml-2">{a.client.phone}</span>}</td>
                {isAdmin && <td className="px-5 py-3 text-zinc-500">{a.barber?.name}</td>}
                <td className="px-5 py-3 text-right font-medium">R$ {Number(a.pricingFinal).toFixed(2)}</td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-zinc-500">Nenhum dado financeiro para o período filtrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
