import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/app/book/[slug]/BookingWizard";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const tenant = await prisma.tenant.findFirst({
    where: { slug: slug, isActive: true },
    include: {
      services: { where: { isActive: true } },
      users: { where: { isBarber: true, isActive: true, deletedAt: null }, select: { id: true, name: true } },
      businessHours: true,
      barberBusinessHours: { where: { isClosed: false } }
    }
  });

  if (!tenant) return notFound();

  // Strip complex relational data to simple POJOs down to client
  const pojoTenant = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    allowChooseBarber: tenant.allowChooseBarber,
    checkinMinutes: (tenant as any).checkinMinutes,
    businessHours: tenant.businessHours.map(bh => ({
      weekday: bh.weekday,
      startTime: bh.startTime,
      endTime: bh.endTime,
      isClosed: bh.isClosed
    }))
  };

  const services = (tenant as any).services.map((s: any) => ({
    id: s.id,
    name: s.name,
    basePrice: Number(s.basePrice),
    durationMinutes: s.durationMinutes
  }));

  const barbers = (tenant as any).users.map((u: any) => ({
    id: u.id,
    name: u.name
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl">
        
        {/* Header Barber */}
        <div className="flex flex-col items-center mb-8">
          {pojoTenant.logoUrl ? (
            <img src={pojoTenant.logoUrl} alt={pojoTenant.name} className="w-20 h-20 rounded-full object-cover mb-4 border dark:border-zinc-800" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4 flex items-center justify-center text-2xl font-bold">
              {pojoTenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-center">{pojoTenant.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">Agende seu horário abaixo</p>
        </div>

        <BookingWizard 
          tenant={pojoTenant} 
          services={services} 
          barbers={barbers} 
        />
        
      </div>
    </div>
  );
}
