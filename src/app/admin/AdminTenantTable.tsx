"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LicenseManager } from "./LicenseManager";
import { impersonateTenant } from "./actions";
import { Building2, CreditCard, Calendar, ArrowUpRight, ShieldCheck, AlertTriangle } from "lucide-react";

type Tenant = {
  id: string;
  name: string;
  status: string;
  licencaTipo: string;
  saldoDevedor: number;
  testeExpiraEm: string | null;
  mensalidadeValor: number | null;
  taxaServicoPct: number | null;
  isActive: boolean;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-500/10 text-green-400 border-green-500/20",
  SUSPENSO: "bg-red-500/10 text-red-400 border-red-500/20",
  INADIMPLENTE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const licencaLabels: Record<string, string> = {
  TESTE_GRATIS: "Teste Grátis",
  MENSALISTA: "Mensalista",
  TAXA_POR_SERVICO: "Taxa por Uso",
};

export function AdminTenantTable({ tenants }: { tenants: Tenant[] }) {
  const [managing, setManaging] = useState<Tenant | null>(null);

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-6 rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl h-full"
    >
      {managing && <LicenseManager tenant={managing} onClose={() => setManaging(null)} />}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Estabelecimentos ({tenants.length})</h2>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            <tr className="border-b border-white/5">
              <th className="pb-4 pr-4">Estabelecimento</th>
              <th className="pb-4 pr-4">Status</th>
              <th className="pb-4 pr-4 text-center">Plano</th>
              <th className="pb-4 pr-4 text-right">Dívida</th>
              <th className="pb-4 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tenants.map((t) => (
              <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 pr-4">
                  <div className="font-semibold text-zinc-100 group-hover:text-white">{t.name}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t.createdAt.slice(0, 10)}
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusColors[t.status] || "bg-zinc-100"}`}>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {t.status}
                  </span>
                </td>
                <td className="py-4 pr-4 text-center">
                  <div className="text-zinc-300 font-medium">{licencaLabels[t.licencaTipo] || t.licencaTipo}</div>
                  {!t.isActive && <div className="text-[10px] text-red-500 font-bold uppercase mt-1">Inativo</div>}
                </td>
                <td className="py-4 pr-4 text-right">
                  <span className={`font-mono font-bold ${t.saldoDevedor > 0 ? "text-red-400" : "text-zinc-600"}`}>
                    {t.saldoDevedor > 0 ? `R$ ${t.saldoDevedor.toFixed(2)}` : "—"}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setManaging(t)}
                      className="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition shadow-sm"
                      title="Gerenciar Licença"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <form action={impersonateTenant}>
                      <input type="hidden" name="tenantId" value={t.id} />
                      <button className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition group-hover:translate-x-1 duration-200">
                        Acessar <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <AlertTriangle className="w-8 h-8 opacity-20" />
                    <p>Nenhum estabelecimento cadastrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
