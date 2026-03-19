"use client";

import { useState } from "react";
import { saveTenantHours } from "./actions";
import { useRouter } from "next/navigation";
import { Clock, Copy, CalendarDays, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function HoursForm({ tenantId, initialHours }: { tenantId: string, initialHours: any[] }) {
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
      alert("Horários salvos com sucesso!");
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      <div className="flex flex-wrap gap-3">
        <button 
          type="button" 
          onClick={copyToAllActive} 
          className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition shadow-sm"
        >
          <Copy className="w-3.5 h-3.5" /> Copiar para ativos
        </button>
        <button 
          type="button" 
          onClick={applyWorkdaysOnly} 
          className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition shadow-sm"
        >
          <CalendarDays className="w-3.5 h-3.5" /> Dias Úteis (Seg-Sex)
        </button>
      </div>

      <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/2 backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-zinc-500">
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] w-20 text-center">Status</th>
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] w-32">Dia</th>
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Abertura</th>
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Fechamento</th>
                <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Intervalo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {hours.map((h, idx) => {
                const isClosed = h.isClosed;

                return (
                  <motion.tr 
                    key={h.weekday}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group transition-all ${isClosed ? 'bg-zinc-950/40' : 'hover:bg-white/5'}`}
                  >
                    <td className="py-4 px-6 align-middle text-center">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!isClosed} 
                            onChange={(e) => updateDay(h.weekday, "isClosed", !e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isClosed ? 'text-zinc-600' : 'text-white'}`}>
                          {WEEKDAYS[h.weekday]}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {isClosed ? 'Fechado' : 'Aberto'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <input type="time" disabled={isClosed} required={!isClosed} value={h.startTime} onChange={(e) => updateDay(h.weekday, "startTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <input type="time" disabled={isClosed} required={!isClosed} value={h.endTime} onChange={(e) => updateDay(h.weekday, "endTime", e.target.value)} className={inputClass} />
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-2">
                        <input type="time" placeholder="Início" disabled={isClosed} value={h.breakStart || ""} onChange={(e) => updateDay(h.weekday, "breakStart", e.target.value)} className={inputClass} />
                        <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                        <input type="time" placeholder="Fim" disabled={isClosed} value={h.breakEnd || ""} onChange={(e) => updateDay(h.weekday, "breakEnd", e.target.value)} className={inputClass} />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-3 text-zinc-500">
           <div className="w-10 h-10 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400">
             <Info className="w-5 h-5" />
           </div>
           <p className="text-xs max-w-sm leading-relaxed">
             Estes horários definem a disponibilidade geral do seu estabelecimento no sistema e afetarão todos os profissionais.
           </p>
        </div>
        
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full md:w-[250px] rounded-2xl bg-zinc-100 py-4 text-sm font-black text-zinc-950 hover:bg-white transition shadow-xl shadow-white/5 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? "Salvando..." : <>SALVAR HORÁRIOS <CheckCircle2 className="w-4 h-4" /></>}
        </button>
      </div>
    </form>
  );
}
