import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { MyHoursForm } from "./MyHoursForm";

export default async function MyHoursPage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");
  
  if (!user.tenantId) {
    return <div className="p-6">Por favor, selecione um estabelecimento pelo painel Admin geral antes.</div>;
  }

  const tenantHours = await prisma.tenantBusinessHour.findMany({
    where: { tenantId: user.tenantId! },
    orderBy: { weekday: "asc" }
  });

  const hours = await prisma.barberBusinessHour.findMany({
    where: { barberId: user.id },
    orderBy: { weekday: "asc" }
  });

  const initialHours = tenantHours.map(th => {
    const existing = hours.find(h => h.weekday === th.weekday);
    return existing ? {
      weekday: th.weekday,
      startTime: existing.startTime,
      endTime: existing.endTime,
      breakStart: existing.breakStart || "",
      breakEnd: existing.breakEnd || "",
      isClosed: existing.isClosed
    } : {
      weekday: th.weekday,
      startTime: th.startTime,
      endTime: th.endTime,
      breakStart: th.breakStart || "",
      breakEnd: th.breakEnd || "",
      isClosed: th.isClosed
    };
  });

  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Meus Horários</h1>
        <p className="text-sm text-zinc-500 font-medium leading-relaxed">Customize sua disponibilidade individual dentro do horário do estabelecimento.</p>
      </header>
      
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[16px] p-8 shadow-sm">
        <MyHoursForm 
          tenantId={user.tenantId!} 
          initialHours={initialHours} 
          userRole={user.role} 
          establishmentHours={tenantHours} 
        />
      </div>
    </div>
  );
}
