import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function TenantHome() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return null;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      scheduledStart: { gte: start, lte: end },
    },
    orderBy: { scheduledStart: "asc" },
    include: { client: true },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 data-[theme=dark]:bg-zinc-950 data-[theme=dark]:text-zinc-50">
      <header className="border-b bg-white/80 backdrop-blur data-[theme=dark]:bg-zinc-950/60 data-[theme=dark]:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">BarberSaaS</span>
            <nav className="hidden gap-3 text-sm text-zinc-700 data-[theme=dark]:text-zinc-200 md:flex">
              <Link href="/tenant" className="hover:text-zinc-900 data-[theme=dark]:hover:text-zinc-50">
                Agenda
              </Link>
              <Link href="/tenant/payments" className="hover:text-zinc-900 data-[theme=dark]:hover:text-zinc-50">
                Pagamentos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 data-[theme=dark]:text-zinc-400 md:inline">
              {user.email}
            </span>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border bg-white p-5 data-[theme=dark]:bg-zinc-900 data-[theme=dark]:border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Agenda de hoje</h2>
            <Link
              className="rounded-xl border bg-white px-3 py-2 text-sm data-[theme=dark]:bg-zinc-950 data-[theme=dark]:border-zinc-800"
              href="/tenant/payments"
            >
              Pagamentos pendentes
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-zinc-500 data-[theme=dark]:text-zinc-400">
                <tr>
                  <th className="py-2 pr-4">Hora</th>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-t data-[theme=dark]:border-zinc-800">
                    <td className="py-2 pr-4 data-[theme=dark]:text-zinc-50">
                      {a.scheduledStart.toTimeString().slice(0, 5)}
                    </td>
                    <td className="py-2 pr-4 font-medium data-[theme=dark]:text-zinc-50">{a.client.name}</td>
                    <td className="py-2 pr-4 data-[theme=dark]:text-zinc-50">{a.status}</td>
                    <td className="py-2 pr-4">
                      <Link
                        className="text-zinc-900 underline data-[theme=dark]:text-zinc-50"
                        href={`/tenant/appointments/${a.id}`}
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 ? (
                  <tr>
                    <td className="py-6 text-zinc-500 data-[theme=dark]:text-zinc-400" colSpan={4}>
                      Nenhum agendamento hoje.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

