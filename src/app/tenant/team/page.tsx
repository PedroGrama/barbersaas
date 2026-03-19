import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";
import { AddBarberForm } from "./AddBarberForm";
import { MemberRow } from "./MemberRow";

export default async function TeamPage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");
  
  if (!user.tenantId) {
    return <div className="p-6">Por favor, selecione um estabelecimento pelo painel Admin geral antes.</div>;
  }

  const team = await prisma.user.findMany({
    where: { 
      tenantId: user.tenantId!, 
      role: { in: ["barbeiro", "tenant_admin"] },
    },
    // Ordenar: admin_tenant primeiro (desc), depois por nome (asc)
    orderBy: [
      { role: "desc" },
      { name: "asc" }
    ]
  });

  return (
    <div className="p-8 space-y-10 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Gestão de Equipe</h1>
        <p className="text-sm text-zinc-500 font-medium">Gerencie permissões, ordene profissionais e controle o acesso à agenda.</p>
      </header>

      <div className="flex flex-col gap-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
               Membros Atuais <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-xs font-black">{team.length}</span>
            </h2>
          </div>
          <ul className="flex flex-col gap-4">
            {team.map(member => (
               <MemberRow key={member.id} member={member} currentUserRole={user.role} />
            ))}
            {team.length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[12px]">
                 <p className="text-sm text-zinc-500 font-medium">Nenhum membro cadastrado até o momento.</p>
              </div>
            )}
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[16px] p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Adicionar Novo Profissional</h2>
            <p className="text-xs text-zinc-500 mt-1">O novo membro receberá acesso por e-mail.</p>
          </div>
          <AddBarberForm tenantId={user.tenantId!} />
        </section>
      </div>
    </div>
  );
}
