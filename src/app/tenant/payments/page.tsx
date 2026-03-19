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
    <>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
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
                  <tr key={p.id} className="border-t dark:border-zinc-800">
                    <td className="py-2 pr-4 font-medium dark:text-zinc-50">
                      {p.appointment.client.name}
                    </td>
                    <td className="py-2 pr-4 dark:text-zinc-50">R$ {p.amount.toFixed(2)}</td>
                    <td className="py-2 pr-4 dark:text-zinc-50">{p.method}</td>
                    <td className="py-2 pr-4 dark:text-zinc-50">
                      {p.pixKey ? `${p.pixKey.keyType}: ${p.pixKey.keyValue}` : "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        className="text-zinc-900 underline dark:text-zinc-50"
                        href={`/tenant/appointments/${p.appointmentId}`}
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {pending.length === 0 ? (
                  <tr>
                    <td className="py-6 text-zinc-500 dark:text-zinc-400" colSpan={5}>
                      Nenhum pagamento pendente.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

