"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMyHours } from "./actions";
import { Clock, RefreshCcw, CheckCircle2, AlertCircle, ChevronRight, Save, UserCheck, CalendarRange } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function MyHoursForm({ tenantId, initialHours, userRole, establishmentHours }: { 
  tenantId: string, 
  initialHours: any[], 
  userRole?: string,
  establishmentHours?: any[]
}) {
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = userRole === "tenant_admin" || userRole === "admin_geral";

  function updateDay(weekday: number, field: string, value: any) {
    setHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  }

  // Comportamento solicitado: Resetar para o horário do estabelecimento
  function syncWithEstablishment() {
    if (!establishmentHours) return;
    
    setHours(prev => prev.map(h => {
      const storeDay = establishmentHours.find(s => s.weekday === h.weekday);
      if (!storeDay) return h;
      return {
        ...h,
        startTime: storeDay.startTime,
        endTime: storeDay.endTime,
        breakStart: storeDay.breakStart || "",
        breakEnd: storeDay.breakEnd || "",
        isClosed: storeDay.isClosed
      };
    }));
    toast("Horários sincronizados com o estabelecimento.", "info");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveMyHours(tenantId, hours);
      toast("Seus horários foram salvos com sucesso!", "success");
      router.refresh();
    } catch (e: any) {
      toast("Erro ao salvar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans font-medium h-10";

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
             <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-none">Ações Rápidas</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Configuração de Larga Escala</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {isAdmin && (
            <button 
              type="button" 
              onClick={syncWithEstablishment} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-100 dark:hover:bg-blue-500/10 transition shadow-sm"
              title="Aplica o horário geral de abertura da loja ao seu perfil"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Copiar do Estabelecimento
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[12px] border border-zinc-100 dark:border-white/10 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
                <th className="py-4 px-6 font-black uppercase tracking-[0.15em] text-[10px] text-zinc-500 w-24 text-center">Atendo</th>
                <th className="py-4 px-6 font-black uppercase tracking-[0.15em] text-[10px] text-zinc-500 w-32">Dia da Semana</th>
                <th className="py-4 px-6 font-black uppercase tracking-[0.15em] text-[10px] text-zinc-500">Entrada</th>
                <th className="py-4 px-6 font-black uppercase tracking-[0.15em] text-[10px] text-zinc-500">Saída</th>
                <th className="py-4 px-6 font-black uppercase tracking-[0.15em] text-[10px] text-zinc-500">Intervalo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
              {hours.map((h, idx) => {
                const isClosed = h.isClosed;

                return (
                  <tr 
                    key={h.weekday}
                    className={`group transition-all duration-200 ${isClosed ? 'bg-zinc-50/30' : 'hover:bg-zinc-50 dark:hover:bg-white/2'}`}
                  >
                    <td className="py-5 px-6 align-middle text-center">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={!isClosed} 
                            onChange={(e) => updateDay(h.weekday, "isClosed", !e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:border-blue-500 shadow-inner"></div>
                        </label>
                      </div>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-bold ${isClosed ? 'text-zinc-400 strike' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {WEEKDAYS[h.weekday]}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isClosed ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {isClosed ? 'Folga' : 'Trabalhando'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <input type="time" step="60" disabled={isClosed} required={!isClosed} value={h.startTime} onChange={(e) => updateDay(h.weekday, "startTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <input type="time" step="60" disabled={isClosed} required={!isClosed} value={h.endTime} onChange={(e) => updateDay(h.weekday, "endTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <div className="flex items-center gap-2">
                        <input type="time" step="60" placeholder="Início" disabled={isClosed} value={h.breakStart || ""} onChange={(e) => updateDay(h.weekday, "breakStart", e.target.value)} className={inputClass} />
                        <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                        <input type="time" step="60" placeholder="Fim" disabled={isClosed} value={h.breakEnd || ""} onChange={(e) => updateDay(h.weekday, "breakEnd", e.target.value)} className={inputClass} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-4 text-zinc-500">
           <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
             <Clock className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
             <p className="text-[13px] font-bold text-zinc-900 dark:text-white leading-none mb-1">Bloqueios Automáticos</p>
             <p className="text-[11px] max-w-sm leading-snug font-medium">
               Horários fora desta grade serão bloqueados para agendamentos online automaticamente.
             </p>
           </div>
        </div>
        
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full md:w-[280px] h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase"
        >
          {loading ? "Salvando..." : <>SALVAR ALTERAÇÕES <Save className="w-4 h-4" /></>}
        </button>
      </div>
    </form>
  );
}
