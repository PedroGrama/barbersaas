import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";

export default async function TenantSettingsPage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");

  if (!user.tenantId) {
    return <div className="p-6">Selecione um estabelecimento.</div>;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId }
  });

  if (!tenant) return <div className="p-6">Estabelecimento não encontrado.</div>;

  // Cast to any to work around stale Prisma client TS types
  const t = tenant as any;

  // Serialize: convert Decimals and Dates to plain values (required for Client Components)
  const serializedTenant = {
    id: t.id,
    name: t.name ?? "",
    slug: t.slug ?? "",
    logoUrl: t.logoUrl ?? null,
    pixKey: t.pixKey ?? "",
    allowChooseBarber: t.allowChooseBarber ?? true,
    licencaTipo: t.licencaTipo ?? null,
    status: t.status ?? null,
    saldoDevedor: t.saldoDevedor ? Number(t.saldoDevedor) : 0,
    mensalidadeValor: t.mensalidadeValor ? Number(t.mensalidadeValor) : null,
    taxaServicoPct: t.taxaServicoPct ? Number(t.taxaServicoPct) : null,
    testeExpiraEm: t.testeExpiraEm ? (t.testeExpiraEm as Date).toISOString() : null,
    checkinMinutes: t.checkinMinutes ?? 15,
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Configurações do Estabelecimento</h1>
        <p className="text-sm text-zinc-500">Personalize o nome, logotipo, chave PIX e a URL de agendamento do seu BladeHub.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <SettingsForm tenant={serializedTenant} />
      </div>

      {serializedTenant.slug && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-2xl p-6">
          <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">Testar Agendamento</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Acesse o link público para ver como os clientes enxergam o seu estabelecimento e agendam horários.
          </p>
          <a 
            href={`/book/${serializedTenant.slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Abrir URL de Agendamento Pública →
          </a>
        </div>
      )}
    </div>
  );
}
