"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateAppointmentStatus, finalizeReview, registerPayment, repassAppointment } from "./actions";
import { 
  Scissors, 
  CheckCircle2, 
  QrCode, 
  Banknote, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  Plus, 
  Minus,
  ShoppingBag,
  Clock
} from "lucide-react";

export function AppointmentWorkflow({ appointment, tenantServices, pixKey, currentUserId }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(appointment?.status || "confirmed");
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>(appointment?.items || []);

  const toggleItem = (service: any) => {
    if (!service) return;
    const exists = selectedItems.find(i => i.serviceId === service.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.serviceId !== service.id));
    } else {
      setSelectedItems([...selectedItems, {
        serviceId: service.id,
        nameSnapshot: service.name,
        unitPriceSnapshot: Number(service.basePrice || 0),
        quantity: 1,
        durationMinutesSnapshot: Number(service.durationMinutes || 0)
      }]);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    await updateAppointmentStatus(appointment.id, "in_progress");
    setStatus("in_progress");
    setLoading(false);
  };

  const currentTotal = selectedItems.reduce((acc, item) => acc + (Number(item?.unitPriceSnapshot || 0) * (item?.quantity || 1)), 0);

  const handleFinishReview = async () => {
    setLoading(true);
    try {
      await finalizeReview(appointment.id, selectedItems, currentTotal);
      setStatus("awaiting_payment");
      setIsReviewing(false);
    } catch(e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handlePayment = async (method: string) => {
    setLoading(true);
    try {
      await registerPayment(appointment.id, method, currentTotal, pixKey?.id);
      setStatus("done");
    } catch(e: any) {
       alert(e.message);
    }
    setLoading(false);
  };

  const handleRepass = async () => {
    if (!confirm("Tem certeza que deseja repassar/cancelar este agendamento?")) return;
    setLoading(true);
    try {
      const res = await repassAppointment(appointment.id);
      if (res.repassed) {
        alert("Agendamento repassado para outro profissional disponível!");
        window.location.href = "/tenant";
      } else {
        alert("Nenhum profissional disponível. O agendamento foi cancelado.");
        setStatus("cancelled");
      }
    } catch(e: any) {
      alert("Erro: " + e.message);
    }
    setLoading(false);
  };

  const cardBase = "w-full max-w-xl bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <AnimatePresence mode="wait">
        
        {/* COMPLETED STATE */}
        {status === "done" && (
          <motion.div 
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase} text-center`}
          >
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">Serviço Concluído!</h2>
            <p className="text-zinc-500 mb-8">O pagamento de <span className="text-white font-bold">R$ {currentTotal.toFixed(2)}</span> foi registrado com sucesso.</p>
            <button 
              onClick={() => window.location.href = "/tenant"}
              className="w-full rounded-2xl bg-zinc-100 py-4 text-sm font-bold text-zinc-900 hover:bg-white transition"
            >
              Voltar para Agenda
            </button>
          </motion.div>
        )}

        {/* PAYMENT STATE */}
        {status === "awaiting_payment" && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cardBase}
          >
            <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
              <QrCode className="w-6 h-6 text-blue-400" /> Recebimento
            </h2>
            
            <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl mb-8 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Confirmado</p>
                <p className="text-4xl font-extrabold text-white tracking-tight">R$ {currentTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-white p-4 rounded-3xl flex justify-center shadow-lg shadow-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixKey?.keyValue || "PENDENTE")}`} 
                  alt="QR Code PIX" 
                  className="w-[180px] h-[180px]" 
                />
              </div>
              <div className="space-y-4">
                 <button 
                   disabled={loading} 
                   onClick={() => handlePayment("PIX_DIRECT")} 
                   className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-bold text-white hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                 >
                   Confirmar PIX <CheckCircle2 className="w-4 h-4" />
                 </button>
                 <button 
                   disabled={loading} 
                   onClick={() => handlePayment("CASH")} 
                   className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-zinc-300 hover:bg-white/10 transition flex items-center justify-center gap-2"
                 >
                   Recebi em Dinheiro <Banknote className="w-4 h-4" />
                 </button>
                 <p className="text-[10px] text-zinc-600 text-center uppercase font-bold tracking-tighter">
                   Após confirmar, o status mudará para concluído
                 </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* REVIEW STATE */}
        {isReviewing && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cardBase}
          >
            <h2 className="text-2xl font-bold mb-2 text-white">Revisão Final</h2>
            <p className="text-sm text-zinc-500 mb-8">Confirme os serviços realizados antes de gerar a cobrança.</p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tenantServices.map((s: any) => {
                const isSelected = !!selectedItems.find(i => i.serviceId === s.id);
                return (
                  <label 
                    key={s.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/5' 
                        : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-white/2 hover:bg-zinc-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-zinc-700'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-600 dark:text-white' : 'text-zinc-900 dark:text-zinc-400'}`}>
                          {s.name}
                        </span>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-600'}`}>{s.durationMinutes} min</div>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                      R$ {Number(s.basePrice).toFixed(2)}
                    </span>
                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleItem(s)} />
                  </label>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total dos Serviços</div>
              <div className="text-2xl font-black text-white">R$ {currentTotal.toFixed(2)}</div>
            </div>

            <button 
              disabled={loading || selectedItems.length === 0} 
              onClick={handleFinishReview} 
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white hover:opacity-90 transition shadow-xl shadow-blue-600/20 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {loading ? "Salvando..." : <>Ir para Recebimento <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button 
              onClick={() => setIsReviewing(false)}
              className="w-full mt-3 text-xs text-zinc-600 font-bold uppercase hover:text-zinc-400 transition"
            >
              Cancelar Revisão
            </button>
          </motion.div>
        )}

        {/* IN_PROGRESS STATE */}
        {status === "in_progress" && !isReviewing && (
          <motion.div 
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase} text-center`}
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2">Atendimento Ativo</h2>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
              Serviço em andamento. Clique abaixo assim que finalizar o atendimento para processar os valores.
            </p>
            
            <button 
              onClick={() => setIsReviewing(true)} 
              className="w-full rounded-2xl bg-white py-4 text-sm font-black text-zinc-950 hover:bg-zinc-200 transition shadow-xl shadow-white/5"
            >
              FINALIZAR SERVIÇO
            </button>
          </motion.div>
        )}

        {/* START/CONFIRMED STATE */}
        {status === "confirmed" && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cardBase} text-center`}
          >
            <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner shadow-blue-500/5">
              <Scissors className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">Novo Cliente?</h2>
            <p className="text-zinc-500 text-sm mb-10 max-w-[280px] mx-auto leading-relaxed">
              O agendamento está confirmado. Clique para iniciar o cronômetro de atendimento.
            </p>
            
            <button 
              disabled={loading} 
              onClick={handleStart} 
              className="w-full rounded-2xl bg-blue-600 py-5 text-base font-black text-white hover:bg-blue-500 transition shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? "Iniciando..." : <>INICIAR AGORA <Play className="w-5 h-5 fill-current" /></>}
            </button>

            <button 
              disabled={loading} 
              onClick={handleRepass} 
              className="mt-8 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hover:text-red-500 transition flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-3 h-3" /> Repassar ou Cancelar
            </button>
          </motion.div>
        )}

        {/* CANCELLED STATE */}
        {status === "cancelled" && (
          <motion.div key="cancelled" className={`${cardBase} text-center opacity-50 grayscale`}>
            <div className="text-zinc-500 text-4xl mb-4">✕</div>
            <h2 className="text-xl font-bold">Agendamento Cancelado</h2>
            <button onClick={() => window.location.href = "/tenant"} className="mt-6 text-sm underline">Voltar</button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
