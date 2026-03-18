import Link from "next/link";
import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateTenantForm } from "@/app/admin/CreateTenantForm";

export default async function AdminHome() {
  const user = await getSessionUser();
  if (!user) return null;

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 px-6 py-6">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">BarberSaaS</span>
            <nav className="hidden gap-3 text-sm text-zinc-700 md:flex">
              <Link href="/admin" className="hover:text-zinc-900">
                Dashboard
              </Link>
              <Link href="/tenant" className="hover:text-zinc-900">
                Área da barbearia
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
        <CreateTenantForm />

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-medium">Barbearias (últimas 20)</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-zinc-500">
                <tr>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Ativa</th>
                  <th className="py-2 pr-4">Criada em</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{t.name}</td>
                    <td className="py-2 pr-4">{t.isActive ? "Sim" : "Não"}</td>
                    <td className="py-2 pr-4">
                      {t.createdAt.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

