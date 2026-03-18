import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function TenantPaymentsPage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return null;

  const pending = await prisma.payment.findMany({
    where: { tenantId: user.tenantId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { appointment: { include: { client: true } }, pixKey: true },
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-zinc-500 data-[theme=dark]:text-zinc-400">
                <tr>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2 pr-4">Chave PIX</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id} className="border-t data-[theme=dark]:border-zinc-800">
                    <td className="py-2 pr-4 font-medium data-[theme=dark]:text-zinc-50">
                      {p.appointment.client.name}
                    </td>
                    <td className="py-2 pr-4 data-[theme=dark]:text-zinc-50">R$ {p.amount.toFixed(2)}</td>
                    <td className="py-2 pr-4 data-[theme=dark]:text-zinc-50">{p.method}</td>
                    <td className="py-2 pr-4 data-[theme=dark]:text-zinc-50">
                      {p.pixKey ? `${p.pixKey.keyType}: ${p.pixKey.keyValue}` : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        className="text-zinc-900 underline data-[theme=dark]:text-zinc-50"
                        href={`/tenant/appointments/${p.appointmentId}`}
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 ? (
                  <tr>
                    <td className="py-6 text-zinc-500 data-[theme=dark]:text-zinc-400" colSpan={5}>
                      Nenhum pagamento pendente.
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

