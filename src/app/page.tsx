import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <main className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">BarberSaaS</h1>
            <p className="mt-1 text-sm text-zinc-700">
              Multi-tenant para barbearias (MVP).
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              className="rounded-xl border-2 border-zinc-900 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-900 hover:text-white transition"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
              href="/tenant"
            >
              Área da barbearia
            </Link>
            <Link
              className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
              href="/admin"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-900">Pronto para desenvolver</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
              <li>Next.js + Tailwind</li>
              <li>Postgres (Docker Compose)</li>
              <li>Prisma (schema + migrations)</li>
              <li>Login básico (cookie/JWT)</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-900">Próximos módulos</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
              <li>Agenda por barbeiro</li>
              <li>Liberação de pagamento no final (PIX/dinheiro)</li>
              <li>Catálogo e horários por tenant</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
