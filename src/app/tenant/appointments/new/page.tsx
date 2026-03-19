import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { WalkinForm } from "./WalkinForm";

export default async function NewWalkinPage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    include: {
      services: { where: { isActive: true } },
      users: { where: { isBarber: true, isActive: true, deletedAt: null }, select: { id: true, name: true } },
    }
  });

  if (!tenant) return <div>Tenant não encontrado.</div>;

  const services = tenant.services.map(s => ({
    id: s.id,
    name: s.name,
    basePrice: Number(s.basePrice),
    durationMinutes: s.durationMinutes
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Novo Agendamento</h1>
      <p className="text-sm text-zinc-500">Crie um agendamento manual para clientes que chegaram sem marcado ou ligaram.</p>

      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <WalkinForm 
          tenantId={tenant.id}
          services={services} 
          barbers={tenant.users} 
          currentUserId={user.id}
          isAdmin={user.role === "tenant_admin" || user.role === "admin_geral"}
        />
      </div>
    </div>
  );
}
