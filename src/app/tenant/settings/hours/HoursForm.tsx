"use client";

import { useState } from "react";
import { saveTenantHours } from "./actions";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ToastProvider";
import { Clock, Copy, CalendarDays, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function HoursForm({ tenantId, initialHours }: { tenantId: string, initialHours: any[] }) {
  const { toast } = useNotification();
  const [hours, setHours] = useState(initialHours);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateDay(weekday: number, field: string, value: any) {
    setHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  }

  function copyToAllActive() {
    const activeDays = hours.filter(h => !h.isClosed);
    if (activeDays.length === 0) return;
    const base = activeDays[0];
    
    setHours(prev => prev.map(h => h.isClosed ? h : {
      ...h,
      startTime: base.startTime,
      endTime: base.endTime,
      breakStart: base.breakStart,
      breakEnd: base.breakEnd
    }));
  }

  function applyWorkdaysOnly() {
    const activeDays = hours.filter(h => !h.isClosed);
    const base = activeDays.length > 0 ? activeDays[0] : hours.find(h => h.weekday === 1)!;
    
    setHours(prev => prev.map(h => ({
      ...h,
      isClosed: h.weekday === 0 || h.weekday === 6,
      startTime: h.weekday > 0 && h.weekday < 6 ? base.startTime : h.startTime,
      endTime: h.weekday > 0 && h.weekday < 6 ? base.endTime : h.endTime,
      breakStart: h.weekday > 0 && h.weekday < 6 ? base.breakStart : h.breakStart,
      breakEnd: h.weekday > 0 && h.weekday < 6 ? base.breakEnd : h.breakEnd
    })));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveTenantHours(tenantId, hours);
      router.refresh();
      toast("Horários salvos com sucesso!", "success");
    } catch (e: any) {
      toast("Erro ao salvar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans font-medium h-10";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
             <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-none">Ações Rápidas</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Configuração em massa</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={copyToAllActive} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 transition shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar para ativos
          </button>
          <button 
            type="button" 
            onClick={applyWorkdaysOnly} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 transition shadow-sm"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Seg-Sex
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 dark:border-white/10 overflow-hidden bg-white dark:bg-zinc-900/50 shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5 text-zinc-500">
                <th className="py-4 px-3 font-black uppercase tracking-[0.15em] text-[10px] w-16 text-center">Aberto</th>
                <th className="py-4 px-3 font-black uppercase tracking-[0.15em] text-[10px] w-24">Dia</th>
                <th className="py-4 px-3 font-black uppercase tracking-[0.15em] text-[10px]">Abertura</th>
                <th className="py-4 px-3 font-black uppercase tracking-[0.15em] text-[10px]">Fechamento</th>
                <th className="py-4 px-3 font-black uppercase tracking-[0.15em] text-[10px]">Intervalo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
              {hours.map((h, idx) => {
                const isClosed = h.isClosed;
                return (
                  <tr key={h.weekday} className={`group transition-all duration-200 ${isClosed ? 'bg-zinc-50/30' : 'hover:bg-zinc-50 dark:hover:bg-white/2'}`}>
                    <td className="py-4 px-3 align-middle text-center">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!isClosed} 
                            onChange={(e) => updateDay(h.weekday, "isClosed", !e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                        </label>
                      </div>
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold leading-tight ${isClosed ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {WEEKDAYS[h.weekday]}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${isClosed ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {isClosed ? 'Fechado' : 'Aberto'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <input type="time" step="60" disabled={isClosed} required={!isClosed} value={h.startTime} onChange={(e) => updateDay(h.weekday, "startTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <input type="time" step="60" disabled={isClosed} required={!isClosed} value={h.endTime} onChange={(e) => updateDay(h.weekday, "endTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-4 px-3 align-middle">
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

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-white/5">
          {hours.map((h) => (
            <div key={h.weekday} className={`p-6 space-y-4 ${h.isClosed ? 'bg-zinc-50/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${h.isClosed ? 'text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {WEEKDAYS[h.weekday]}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {h.isClosed ? 'Fechado' : 'Aberto'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!h.isClosed} 
                    onChange={(e) => updateDay(h.weekday, "isClosed", !e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                </label>
              </div>

              {!h.isClosed && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Entrada</label>
                    <input type="time" step="60" value={h.startTime} onChange={(e) => updateDay(h.weekday, "startTime", e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Saída</label>
                    <input type="time" step="60" value={h.endTime} onChange={(e) => updateDay(h.weekday, "endTime", e.target.value)} className={inputClass} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Intervalo</label>
                    <div className="flex items-center gap-2">
                       <input type="time" step="60" value={h.breakStart || ""} onChange={(e) => updateDay(h.weekday, "breakStart", e.target.value)} className={inputClass} />
                       <ChevronRight className="w-4 h-4 text-zinc-300" />
                       <input type="time" step="60" value={h.breakEnd || ""} onChange={(e) => updateDay(h.weekday, "breakEnd", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-4 text-zinc-500">
           <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
             <Clock className="w-6 h-6" />
           </div>
           <div className="flex flex-col text-left">
             <p className="text-[13px] font-bold text-zinc-900 dark:text-white leading-none mb-1">Disponibilidade Geral</p>
             <p className="text-[11px] max-w-sm leading-snug font-medium">
               Define os limites de funcionamento da unidade que afetam todos os profissionais.
             </p>
           </div>
        </div>
        
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full md:w-[280px] h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest uppercase"
        >
          {loading ? "Salvando..." : <>SALVAR HORÁRIOS <CheckCircle2 className="w-4 h-4" /></>}
        </button>
      </div>
    </form>
  );
}
