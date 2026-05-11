import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateTenantForm } from "@/app/admin/CreateTenantForm";
import { DashboardClient } from "./DashboardClient";
import { AdminTenantTable } from "@/app/admin/AdminTenantTable";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";

export default async function AdminHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin_geral") redirect("/tenant");

  const tenants = await prisma.tenant.findMany({ 
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = tenants.map((t: any) => ({
    id: t.id,
    name: t.name,
    isActive: t.isActive,
    status: t.status ?? "ATIVO",
    licencaTipo: t.licencaTipo ?? "TESTE_GRATIS",
    saldoDevedor: Number(t.saldoDevedor ?? 0),
    testeExpiraEm: t.testeExpiraEm ? (t.testeExpiraEm as Date).toISOString() : null,
    mensalidadeValor: t.mensalidadeValor ? Number(t.mensalidadeValor) : null,
    taxaServicoPct: t.taxaServicoPct ? Number(t.taxaServicoPct) : null,
    createdAt: t.createdAt.toISOString(),
  }));

  // ── Real KPIs for production ───────────────────────────────────
  let dashboardData = undefined;
  if (process.env.NODE_ENV === "production") {
    const [ativos, inadimplentes, suspensos, agendamentosMes, ticketResult] =
      await Promise.all([
        prisma.tenant.count({ where: { status: "ATIVO", isActive: true } } as any),
        prisma.tenant.count({ where: { status: "INADIMPLENTE", isActive: true } } as any),
        prisma.tenant.count({ where: { OR: [{ status: "SUSPENSO" }, { isActive: false }] } } as any),
        prisma.appointment.count({
          where: {
            scheduledStart: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        }),
        prisma.payment.aggregate({
          _avg: { amount: true },
          where: { status: "PAID" },
        }),
      ]);

    dashboardData = {
      kpis: {
        tenantsAtivos: ativos,
        inadimplentes: inadimplentes,
        inativos: suspensos,
        ticketMedio: Number(ticketResult._avg.amount ?? 0),
        agendamentosMes,
      },
    };
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 transition-colors duration-300">
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-white/5 z-50 transition-colors">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              BladeHub <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded ml-2 font-mono">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 md:inline">{user.email}</span>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="rounded-full bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-12 px-6 pb-20 pt-28">
        {/* Background Orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-3xl opacity-30 dark:opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-3xl opacity-30 dark:opacity-50" />
        </div>

        <DashboardClient data={dashboardData} />
        
        <div className="grid lg:grid-cols-2 gap-10">
          <CreateTenantForm />
          <AdminTenantTable tenants={serialized} />
        </div>
      </main>
    </div>
  );
}
