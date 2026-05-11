import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { DollarSign, CheckCircle2, AlertCircle, FileText, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default async function TenantPaymentsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ days?: string; status?: string }> 
}) {
  const { days = "7", status = "all" } = await searchParams;
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");
  
  const targetDays = parseInt(days);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - targetDays);

  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - targetDays);

  const baseWhere = {
    tenantId: user.tenantId,
    ...(status !== "all" ? { status: status.toUpperCase() } : {}),
  };

  const [currentPayments, prevPayments] = await Promise.all([
    (prisma.payment as any).findMany({
      where: { ...baseWhere, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      include: { 
        appointment: { 
          include: { client: true, items: { include: { service: true } }, barber: true } 
        } 
      }
    }),
    (prisma.payment as any).findMany({
      where: { ...baseWhere, createdAt: { gte: prevStartDate, lt: startDate } },
      select: { amount: true, status: true }
    })
  ]);

  // Frontend calculation for Metrics
  const currentRecebido = currentPayments.filter((p: any) => p.status === "PAID").reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const currentPendente = currentPayments.filter((p: any) => p.status === "PENDING").reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const currentQty = currentPayments.length;
  const currentTicket = currentQty > 0 ? (currentRecebido + currentPendente) / currentQty : 0;

  const prevRecebido = prevPayments.filter((p: any) => p.status === "PAID").reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const prevPendente = prevPayments.filter((p: any) => p.status === "PENDING").reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  const prevQty = prevPayments.length;
  const prevTicket = prevQty > 0 ? (prevRecebido + prevPendente) / prevQty : 0;

  function getPctText(curr: number, prev: number) {
    if (prev === 0 && curr === 0) return null;
    if (prev === 0) return { val: "+100%", pos: true };
    const pct = ((curr - prev) / prev) * 100;
    if (pct === 0) return { val: "0%", pos: null };
    return { val: `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`, pos: pct > 0 };
  }

  const metrics = [
    { label: "Total recebido", value: `R$ ${currentRecebido.toFixed(2)}`, icon: DollarSign, color: "text-green-500", pct: getPctText(currentRecebido, prevRecebido) },
    { label: "Total pendente", value: `R$ ${currentPendente.toFixed(2)}`, icon: AlertCircle, color: "text-amber-500", pct: getPctText(currentPendente, prevPendente) },
    { label: "Serviços realizados", value: currentQty.toString(), icon: CheckCircle2, color: "text-blue-500", pct: getPctText(currentQty, prevQty) },
    { label: "Ticket médio", value: `R$ ${currentTicket.toFixed(2)}`, icon: FileText, color: "text-purple-500", pct: getPctText(currentTicket, prevTicket) }
  ];

  const statusStyle: Record<string, string> = {
    PAID: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
  };
  const statusLabel: Record<string, string> = { PAID: "Pago", PENDING: "Pendente", CANCELLED: "Cancelado", FAILED: "Falha" };

  return (
    <main className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 min-h-screen">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pagamentos</h1>
        <p className="text-sm text-zinc-500">Histórico de transações e métricas do estabelecimento.</p>
      </header>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{m.value}</div>
            
            <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 flex items-center gap-1 mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {m.pct ? (
                <>
                  <span className={`flex items-center ${m.pct.pos === true ? 'text-green-600 dark:text-green-400' : m.pct.pos === false ? 'text-red-600 dark:text-red-400' : 'text-zinc-500'}`}>
                    {m.pct.pos === true ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : m.pct.pos === false ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                    {m.pct.val}
                  </span>
                  vs. período anterior
                </>
              ) : (
                "Sem dados anteriores"
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 py-2 border-y border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Período</span>
          {[7, 15, 30].map(d => (
            <Link 
              key={d} href={`?days=${d}&status=${status}`} scroll={false}
              className={`px-4 py-1.5 rounded-full text-xs transition-colors border ${targetDays === d ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {d} dias
            </Link>
          ))}
        </div>
        <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Status</span>
          {[{v: "all", l: "Todos"}, {v: "paid", l: "Pagos"}, {v: "pending", l: "Pendentes"}].map(s => (
            <Link 
              key={s.v} href={`?days=${days}&status=${s.v}`} scroll={false}
              className={`px-4 py-1.5 rounded-full text-xs transition-colors border ${status === s.v ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {s.l}
            </Link>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400 w-28">Data</th>
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400 w-1/4">Cliente</th>
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400">Serviço(s)</th>
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400 w-32">Profissional</th>
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400 w-28">Status</th>
              <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-400 w-32 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {currentPayments.map((p: any) => {
              const items = p.appointment.items || [];
              const mainService = items[0]?.service?.name || "Produto/Diversos";
              const extraCount = items.length > 1 ? ` (+${items.length - 1})` : "";
              
              return (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 align-middle">
                    <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="block text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="py-4 px-4 align-middle overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">{p.appointment.client.name}</span>
                  </td>
                  <td className="py-4 px-4 align-middle overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="inline-block px-2 mt-1 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-full">
                      {mainService}{extraCount}
                    </span>
                  </td>
                  <td className="py-4 px-4 align-middle overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{p.appointment.barber.name.split(' ')[0]}</span>
                  </td>
                  <td className="py-4 px-4 align-middle">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyle[p.status]}`}>
                      {statusLabel[p.status] || p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 align-middle text-right">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">R$ {Number(p.amount).toFixed(2)}</span>
                  </td>
                </tr>
              );
            })}
            
            {currentPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-400">
                  <p className="text-sm font-medium">Nenhum pagamento encontrado para este filtro.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

