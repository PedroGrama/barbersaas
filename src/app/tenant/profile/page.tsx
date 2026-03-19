import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { UserCircle2, ChevronRight, ShieldCheck, User } from "lucide-react";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user || !user.tenantId) redirect("/login");

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!fullUser) redirect("/login");

  const isAdmin = user.role === "tenant_admin" || user.role === "admin_geral";

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 min-h-screen font-sans">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
           <User className="w-4 h-4" /> Configurações de Identidade
        </div>
        <div className="flex items-center gap-2">
           <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Meu Perfil</h1>
           <span className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1.5 shadow-sm">
             {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> : <UserCircle2 className="w-3.5 h-3.5 text-zinc-400" />}
             {user.role === "tenant_admin" ? "Administrador" : user.role === "admin_geral" ? "Admin Geral" : "Profissional"}
           </span>
        </div>
        <p className="text-sm text-zinc-500 font-medium">Garanta que suas informações estejam corretas para clientes e colegas.</p>
      </header>

      <ProfileForm user={fullUser} tenant={tenant} isAdmin={isAdmin} />
    </div>
  );
}
