import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { HoursForm } from "@/app/tenant/settings/hours/HoursForm";

export default async function TenantHoursPage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");
  
  if (!user.tenantId) { 
    return <div className="p-6">Por favor, selecione um estabelecimento pelo painel Admin geral antes.</div>;
  }

  const hours = await prisma.tenantBusinessHour.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { weekday: "asc" }
  });

  const defaultHours = Array.from({ length: 7 }).map((_, i) => ({
    weekday: i,
    startTime: "09:00",
    endTime: "18:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    isClosed: i === 0, // Domingo fechado
  }));

  const initialHours = defaultHours.map(dh => {
    const existing = hours.find(h => h.weekday === dh.weekday);
    return existing ? {
      ...dh,
      startTime: existing.startTime,
      endTime: existing.endTime,
      breakStart: existing.breakStart || "",
      breakEnd: existing.breakEnd || "",
      isClosed: existing.isClosed
    } : dh;
  });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Horários do Estabelecimento</h1>
      <p className="text-sm text-zinc-500">Configure o horário geral de funcionamento do estabelecimento.</p>
      
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5">
        <HoursForm tenantId={user.tenantId} initialHours={initialHours} />
      </div>
    </div>
  );
}
