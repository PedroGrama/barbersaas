import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { Calendar, Plus, CreditCard, ChevronRight, User, Clock as ClockIcon, TrendingUp } from "lucide-react";
import { DatePicker } from "./DatePicker";

export default async function TenantHome({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const targetDate = date ? new Date(date + "T12:00:00") : new Date();
  
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  const isAdmin = user.role === "tenant_admin" || user.role === "admin_geral";

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      scheduledStart: { gte: start, lte: end },
      ...(isAdmin ? {} : { barberId: user.id }),
    },
    orderBy: { scheduledStart: "asc" },
    include: { client: true, barber: true },
    take: 50,
  });

  const dateStr = targetDate.toISOString().split('T')[0];

  return (
    <main className="p-8 max-w-6xl mx-auto font-sans min-h-screen">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
               <TrendingUp className="w-3.5 h-3.5" /> Dashboard em tempo real
            </div>
            <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Agenda do Dia</h1>
            <p className="text-sm text-zinc-500 font-medium">Visualize e controle seus compromissos para hoje.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <DatePicker initialDate={dateStr} />
            <Link
              href={`/tenant/appointments/new?date=${dateStr}`}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              <Plus className="w-4 h-4" /> Novo Agendamento
            </Link>
          </div>
        </header>

        {/* content card */}
        <section className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[16px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-50 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Cronograma de Serviços</h3>
            </div>
            
            <Link href="/tenant/payments" className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
               <CreditCard className="w-3.5 h-3.5" /> Ver Pagamentos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden">
            {/* Desktop Table */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-white/2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="py-4 px-8 w-32"><div className="flex items-center gap-2"><ClockIcon className="w-3 h-3" /> Horário</div></th>
                  <th className="py-4 px-6"><div className="flex items-center gap-2"><User className="w-3 h-3" /> Cliente</div></th>
                  {isAdmin && <th className="py-4 px-6">Profissional</th>}
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                {appointments.map((a) => {
                  const statusPt: Record<string, string> = {
                    confirmed: "Confirmado",
                    in_progress: "Em atendimento",
                    awaiting_payment: "Aguard. pagamento",
                    done: "Concluído",
                    cancelled: "Cancelado",
                    no_show: "Não compareceu",
                  };
                  const statusColor: Record<string, string> = {
                    confirmed: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100/50 dark:border-blue-500/20",
                    in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100/50 dark:border-amber-500/20",
                    awaiting_payment: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100/50 dark:border-orange-500/20",
                    done: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100/50 dark:border-green-500/20",
                    cancelled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-100/50 dark:border-red-500/20",
                    no_show: "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400 border-zinc-200 dark:border-white/10",
                  };
                  return (
                    <tr key={a.id} className="group hover:bg-zinc-50 dark:hover:bg-white/2 transition-colors duration-200">
                      <td className="py-5 px-8">
                        <span className="text-sm font-black text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-zinc-200 dark:border-white/10">
                          {a.scheduledStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">{a.client.name}</span>
                          <span className="text-[10px] font-medium text-zinc-500">Agendado agora</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-5 px-6">
                           <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-white/5 px-2 py-1 rounded-md">{a.barber.name}</span>
                        </td>
                      )}
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor[a.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                          {statusPt[a.status] ?? a.status}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <Link
                          className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-tight"
                          href={`/tenant/appointments/${a.id}`}
                        >
                          Detalhes <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="grid grid-cols-1 divide-y divide-zinc-50 dark:divide-white/5 md:hidden">
              {appointments.map((a) => {
                const statusPt: Record<string, string> = {
                  confirmed: "Confirmado",
                  in_progress: "Em atendimento",
                  awaiting_payment: "Aguard. pagamento",
                  done: "Concluído",
                  cancelled: "Cancelado",
                  no_show: "Não compareceu",
                };
                const statusColor: Record<string, string> = {
                  confirmed: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                  in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                  awaiting_payment: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
                  done: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
                  cancelled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
                  no_show: "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
                };

                return (
                  <div key={a.id} className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-zinc-200 dark:border-white/10">
                        {a.scheduledStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${statusColor[a.status]}`}>
                        {statusPt[a.status] || a.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-zinc-900 dark:text-white">{a.client.name}</span>
                        {isAdmin && <span className="text-[10px] text-zinc-500 font-medium">{a.barber.name}</span>}
                      </div>
                      <Link
                        href={`/tenant/appointments/${a.id}`}
                        className="h-8 px-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-tight flex items-center gap-1"
                      >
                        Detalhes <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {appointments.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                 <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-300">
                    <Calendar className="w-8 h-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Nenhum compromisso encontrado</p>
                    <p className="text-xs text-zinc-500">Parece que você está livre para relaxar ou planejar seu dia.</p>
                 </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
