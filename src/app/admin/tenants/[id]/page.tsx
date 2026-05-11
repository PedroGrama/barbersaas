import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect, notFound } from "next/navigation";
import { TenantDetailsClient } from "@/app/admin/tenants/[id]/TenantDetailsClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin_geral") redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: resolvedParams.id },
    include: {
      _count: {
        select: {
          users: true,
          services: true,
          appointments: true
        }
      }
    }
  });

  if (!tenant) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Detalhes do Estabelecimento
          </h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            Gestão Central BladeHub
          </p>
        </div>
      </div>

      <TenantDetailsClient tenant={JSON.parse(JSON.stringify(tenant))} />
    </div>
  );
}
