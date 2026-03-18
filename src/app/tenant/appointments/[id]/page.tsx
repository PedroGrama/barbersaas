import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function TenantAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !user.tenantId) return null;
  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, tenantId: user.tenantId },
    include: {
      client: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!appointment) return notFound();

  const latestPayment = appointment.payments[0] ?? null;

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

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agendamento</h1>
            <p className="mt-1 text-sm text-zinc-600 data-[theme=dark]:text-zinc-400">{appointment.id}</p>
          </div>
          <Link className="rounded-xl border bg-white px-3 py-2 text-sm data-[theme=dark]:bg-zinc-950 data-[theme=dark]:border-zinc-800" href="/tenant">
            Voltar
          </Link>
        </header>

        <section className="rounded-2xl border bg-white p-5 space-y-2 data-[theme=dark]:bg-zinc-900 data-[theme=dark]:border-zinc-800">
          <div className="text-sm text-zinc-600 data-[theme=dark]:text-zinc-400">Cliente</div>
          <div className="font-medium data-[theme=dark]:text-zinc-50">{appointment.client.name}</div>
          <div className="text-sm text-zinc-700 data-[theme=dark]:text-zinc-200">{appointment.client.phone}</div>
          <div className="pt-2 text-sm text-zinc-600 data-[theme=dark]:text-zinc-400">Status</div>
          <div className="font-medium data-[theme=dark]:text-zinc-50">{appointment.status}</div>
        </section>

        <section className="rounded-2xl border bg-white p-5 data-[theme=dark]:bg-zinc-900 data-[theme=dark]:border-zinc-800">
          <h2 className="font-medium">Serviços realizados</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {appointment.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between border rounded-xl px-3 py-2 data-[theme=dark]:border-zinc-800">
                <div>
                  <div className="font-medium data-[theme=dark]:text-zinc-50">{it.nameSnapshot}</div>
                  <div className="text-zinc-600 data-[theme=dark]:text-zinc-400">
                    {it.durationMinutesSnapshot} min · x{it.quantity}
                  </div>
                </div>
                <div className="font-medium data-[theme=dark]:text-zinc-50">
                  R$ {it.unitPriceSnapshot.toFixed(2)}
                </div>
              </li>
            ))}
            {appointment.items.length === 0 ? (
              <li className="text-zinc-500 data-[theme=dark]:text-zinc-400">Sem itens ainda.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border bg-white p-5 space-y-3 data-[theme=dark]:bg-zinc-900 data-[theme=dark]:border-zinc-800">
          <h2 className="font-medium">Cobrança (final do corte)</h2>
          <div className="text-sm text-zinc-700 data-[theme=dark]:text-zinc-200">
            Total final: <span className="font-medium">R$ {appointment.pricingFinal.toFixed(2)}</span>
          </div>

          {latestPayment ? (
            <div className="rounded-xl border bg-zinc-50 px-3 py-2 text-sm data-[theme=dark]:bg-zinc-950 data-[theme=dark]:border-zinc-800">
              Último pagamento: <span className="font-medium">{latestPayment.method}</span> ·{" "}
              <span className="font-medium">{latestPayment.status}</span>
            </div>
          ) : (
            <div className="text-sm text-zinc-600 data-[theme=dark]:text-zinc-400">
              Nenhuma cobrança liberada ainda.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <form action={`/tenant/appointments/${appointment.id}/release-pix`} method="post">
              <button className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white">
                Liberar PIX (direto)
              </button>
            </form>
            <form action={`/tenant/appointments/${appointment.id}/mark-cash`} method="post">
              <button className="rounded-xl border bg-white px-3 py-2 text-sm data-[theme=dark]:bg-zinc-950 data-[theme=dark]:border-zinc-800">
                Marcar pago em dinheiro
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

