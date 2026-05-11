"use client";

import { useState } from "react";
import { updateTenantBilling, updateTenantStatus, impersonateTenant } from "../../actions";
import { useNotification } from "@/components/ToastProvider";
import { 
  Building2, 
  Users, 
  Scissors, 
  Calendar, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Save,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

export function TenantDetailsClient({ tenant }: { tenant: any }) {
  const { toast, confirm } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    const action = tenant.isActive ? "suspender" : "ativar";
    const ok = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Estabelecimento`,
      message: `Tem certeza que deseja ${action} o estabelecimento "${tenant.name}"? Isso afetará o acesso de todos os membros e o agendamento público.`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      cancelLabel: "Cancelar"
    });

    if (ok) {
      setLoading(true);
      try {
        await updateTenantStatus(tenant.id, !tenant.isActive);
        toast(`Estabelecimento ${!tenant.isActive ? 'ativado' : 'suspenso'} com sucesso!`, "success");
      } catch (err: any) {
        toast(err.message, "error");
      }
      setLoading(false);
    }
  };

  async function handleBillingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTenantBilling(new FormData(e.currentTarget));
      toast("Configurações financeiras atualizadas!", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Membros", value: tenant._count.users, icon: Users, color: "text-blue-400 bg-blue-400/10" },
    { label: "Serviços", value: tenant._count.services, icon: Scissors, color: "text-indigo-400 bg-indigo-400/10" },
    { label: "Total de Agendamentos", value: tenant._count.appointments, icon: Calendar, color: "text-green-400 bg-green-400/10" },
    { label: "Saldo Devedor", value: `R$ ${Number(tenant.saldoDevedor || 0).toFixed(2)}`, icon: CreditCard, color: "text-red-400 bg-red-400/10" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ── COLUNA ESQUERDA: Perfil e Status ── */}
      <div className="lg:col-span-1 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full -mr-16 -mt-16" />
          
          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="w-24 h-24 rounded-full border-4 border-white/5 bg-zinc-800 flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                tenant.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{tenant.name}</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">ID: {tenant.id.slice(0, 8)}...</p>
            </div>

            <div className="w-full pt-4 space-y-3">
              <span className={`inline-flex w-full justify-center px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                tenant.isActive 
                  ? "bg-green-500/10 text-green-400 border-green-500/20" 
                  : "bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/5 animate-pulse"
              }`}>
                {tenant.isActive ? "Operacional" : "Acesso Restrito"}
              </span>

              <button 
                onClick={handleToggleStatus}
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  tenant.isActive
                    ? "border-red-500/20 text-red-500 hover:bg-red-500/10"
                    : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                }`}
              >
                {tenant.isActive ? "Suspender Estabelecimento" : "Ativar Estabelecimento"}
              </button>
            </div>

            <div className="w-full pt-4 border-t border-white/5 space-y-4">
              <form action={impersonateTenant}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <button className="w-full py-5 rounded-2xl bg-zinc-100 text-zinc-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition shadow-xl shadow-black/20 flex items-center justify-center gap-2 group">
                  Simular Acesso <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/3 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-2 group hover:bg-white/5 transition"
            >
              <div className={`p-3 rounded-2xl ${s.color} transition-transform group-hover:scale-110`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-white tracking-tight">{s.value}</div>
              <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── COLUNA DIREITA: Faturamento e Planos ── */}
      <div className="lg:col-span-2 space-y-8">
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Configurações Financeiras</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Painel de Rentabilização</p>
            </div>
          </div>

          <form onSubmit={handleBillingSubmit} className="space-y-8">
            <input type="hidden" name="tenantId" value={tenant.id} />
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Modelo de Faturamento</label>
                <div className="space-y-3">
                  {["TESTE_GRATIS", "MENSALISTA", "TAXA_POR_SERVICO"].map((tipo) => (
                    <label 
                      key={tipo}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        tenant.licencaTipo === tipo 
                          ? "bg-indigo-500/10 border-indigo-500/50 text-white" 
                          : "bg-white/2 border-white/5 text-zinc-500 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="licencaTipo" 
                          value={tipo} 
                          defaultChecked={tenant.licencaTipo === tipo}
                          className="w-4 h-4 text-indigo-500 border-zinc-700 bg-transparent focus:ring-indigo-500" 
                        />
                        <span className="text-sm font-bold uppercase tracking-tight">
                          {tipo === "TESTE_GRATIS" ? "Teste Grátis" : tipo === "MENSALISTA" ? "Plano Mensalista" : "Taxa por Uso"}
                        </span>
                      </div>
                      <Zap className={`w-4 h-4 ${tenant.licencaTipo === tipo ? "text-indigo-400" : "text-zinc-700"}`} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Valor da Mensalidade (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-xs uppercase tracking-widest">R$</span>
                    <input 
                      type="number" 
                      name="mensalidadeValor"
                      step="0.01"
                      defaultValue={Number(tenant.mensalidadeValor || 0).toFixed(2)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/2 border border-white/5 text-xl font-black text-white focus:border-indigo-500/50 transition outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Taxa de Serviço (%)</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-xs uppercase tracking-widest">%</span>
                    <input 
                      type="number" 
                      name="taxaServicoPct"
                      step="0.1"
                      defaultValue={Number(tenant.taxaServicoPct || 3).toFixed(1)}
                      className="w-full pl-6 pr-12 py-4 rounded-2xl bg-white/2 border border-white/5 text-xl font-black text-white focus:border-indigo-500/50 transition outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-tighter">Aplicado somente no plano "Taxa por Uso"</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? "Processando..." : "Salvar Alterações de Faturamento"}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/3 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white tracking-tighter uppercase italic">Histórico de Atividade</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Recurso Premium em Breve</p>
            </div>
          </div>
          <Clock className="w-8 h-8 text-zinc-800 transition-transform group-hover:rotate-12" />
        </motion.div>

      </div>
    </div>
  );
}
