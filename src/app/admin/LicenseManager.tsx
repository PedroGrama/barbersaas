"use client";

import { useState } from "react";
import { X, ShieldCheck, Zap, CreditCard, Calendar, BarChart3 } from "lucide-react";

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

export function LicenseManager({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [licencaTipo, setLicencaTipo] = useState(tenant.licencaTipo);
  const [mensalidadeValor, setMensalidadeValor] = useState(String(tenant.mensalidadeValor || "99"));
  const [taxaServicoPct, setTaxaServicoPct] = useState(String(tenant.taxaServicoPct || "3"));
  const [extendDays, setExtendDays] = useState("30");

  const doAction = async (action: string, extra: Record<string, any> = {}) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/license", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, action, ...extra }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || "OK");
    } catch (e) {
      setMsg("Erro de rede.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-zinc-950 rounded-3xl border border-white/10 p-8 w-full max-w-lg shadow-2xl space-y-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Gerenciar Licença</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Estabelecimento</p>
          <p className="text-lg font-semibold text-white">{tenant.name}</p>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-zinc-300 animate-in fade-in slide-in-from-top-2 duration-300">
            {msg}
          </div>
        )}

        <div className="space-y-8">
          {/* Status actions */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3" /> Ações de Status
            </p>
            <div className="flex gap-2 flex-wrap">
              <button disabled={loading} onClick={() => doAction("suspend")} className="text-xs px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold">
                Suspender
              </button>
              <button disabled={loading} onClick={() => doAction("reactivate")} className="text-xs px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 transition-all font-bold">
                Reativar
              </button>
              <button disabled={loading} onClick={() => doAction("mark_paid")} className="text-xs px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-all font-bold flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Quitar Dívida (R$ {Number(tenant.saldoDevedor).toFixed(2)})
              </button>
            </div>
          </div>

          {/* Extend trial */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Estender Período
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={extendDays}
                onChange={e => setExtendDays(e.target.value)}
                className="w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                min="1"
              />
              <span className="text-xs font-medium text-zinc-500">dias</span>
              <button disabled={loading} onClick={() => doAction("extend_trial", { extendDays })} className="text-xs px-4 py-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all font-bold">
                Estender Acesso
              </button>
            </div>
          </div>

          {/* Change license */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-3 h-3" /> Alterar Plano de Assinatura
            </p>
            <select value={licencaTipo} onChange={e => setLicencaTipo(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none cursor-pointer hover:bg-white/10 transition-all">
              <option value="TESTE_GRATIS" className="bg-zinc-950">Teste Grátis</option>
              <option value="MENSALISTA" className="bg-zinc-950">Mensalidade Fixa</option>
              <option value="TAXA_POR_SERVICO" className="bg-zinc-950">Taxa por Serviço</option>
            </select>

            {licencaTipo === "MENSALISTA" && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 animate-in zoom-in-95 duration-200">
                <span className="text-xs font-bold text-zinc-500 uppercase">Valor:</span>
                <input type="number" value={mensalidadeValor} onChange={e => setMensalidadeValor(e.target.value)} className="w-32 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="0.00" />
              </div>
            )}

            {licencaTipo === "TAXA_POR_SERVICO" && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 animate-in zoom-in-95 duration-200">
                <span className="text-xs font-bold text-zinc-500 uppercase">Percentual (%):</span>
                <input type="number" step="0.1" value={taxaServicoPct} onChange={e => setTaxaServicoPct(e.target.value)} className="w-32 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="0.0" />
              </div>
            )}

            <button disabled={loading} onClick={() => doAction("change_license", { licencaTipo, mensalidadeValor, taxaServicoPct })} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white hover:opacity-90 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50">
              {loading ? "Salvando Alterações..." : "Confirmar Mudança de Plano"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
