import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { ServicesList } from "./ServicesList";

export default async function ServicesPage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");

  if (!user.tenantId) {
    return <div className="p-6">Por favor, selecione uma barbearia primeiro.</div>;
  }

  const rawServices = await prisma.service.findMany({
    where: { tenantId: user.tenantId, isActive: true },
    orderBy: { name: "asc" }
  });

  const services = rawServices.map(s => ({
    ...s,
    basePrice: Number(s.basePrice)
  }));

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Catálogo de Serviços</h1>
      <p className="text-sm text-zinc-500">
        Gerencie os serviços oferecidos e os preços base. Estes são os serviços que seus clientes poderão selecionar.
      </p>

      <ServicesList tenantId={user.tenantId} initialServices={services} />
    </div>
  );
}
