import { getSessionUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { redirect } from "next/navigation";

export default async function SharePage() {
  const user = await getSessionUser();
  if (!user || (!user.tenantId && user.role !== "admin_geral")) redirect("/login");

  if (!user.tenantId) {
    return <div className="p-6">Selecione uma barbearia primeiro.</div>;
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });

  if (!tenant || !tenant.slug) {
    return (
      <div className="p-6">
        Sua barbearia precisa ter uma URL de agendamento (slug) configurada. Vá em Administração -{">"} Configurações.
      </div>
    );
  }

  const publicUrl = `http://localhost:3000/book/${tenant.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Divulgar Barbearia</h1>
      <p className="text-sm text-zinc-500">Compartilhe este link ou baixe o QR Code para colocar na entrada do estabelecimento.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <h2 className="font-medium">QR Code Público</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl} alt="QR Code Agendamento" className="w-[200px] h-[200px] bg-white p-2 rounded-xl" />
          <a download="barbersaas_qrcode.png" href={qrCodeUrl} target="_blank" className="text-sm text-blue-600 underline">Abrir em nova guia para imprimir</a>
        </div>

        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-center">
          <h2 className="font-medium">Link de Agendamento</h2>
          <div className="bg-zinc-100 dark:bg-zinc-950 border dark:border-zinc-800 p-3 rounded-xl break-all font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {publicUrl}
          </div>
          <a 
            href={publicUrl} 
            target="_blank" 
            className="w-full text-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition block"
          >
            Testar Página do Cliente
          </a>
        </div>
      </div>
    </div>
  );
}
