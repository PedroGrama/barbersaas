"use client";

import { useEffect, useState } from "react";
import { doCheckIn } from "./actions";

export function TrackerClient({ appointment, slug }: { appointment: any, slug: string }) {
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(appointment.checkedIn);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000); // update every 10s
    return () => clearInterval(t);
  }, []);

  const scheduledStart = new Date(appointment.scheduledStart);
  const diffMinutes = (scheduledStart.getTime() - now.getTime()) / 60000;

  const canCheckIn = diffMinutes <= 30 && diffMinutes > 0 && !checkedIn && appointment.status !== "cancelled";
  const isWarning = diffMinutes <= 10 && diffMinutes > 0 && !checkedIn && appointment.status !== "cancelled";

  async function handleCheckIn() {
    setLoading(true);
    try {
      await doCheckIn(appointment.id);
      setCheckedIn(true);
      alert("Check-in realizado com sucesso! Aguarde ser chamado.");
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl text-center">
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
        📅
      </div>
      <h1 className="text-2xl font-bold mb-1">Agendamento em {appointment.tenantName}</h1>
      <p className="text-zinc-500 mb-6 font-medium">Com: {appointment.barberName}</p>

      <div className="bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl p-4 mb-6 text-left">
        <div className="flex justify-between items-center py-2 border-b dark:border-zinc-800">
          <span className="text-zinc-500">Data e Hora</span>
          <span className="font-semibold">{scheduledStart.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b dark:border-zinc-800">
          <span className="text-zinc-500">Valor Previsto</span>
          <span className="font-semibold">R$ {appointment.totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-zinc-500">Status</span>
          <span className="font-semibold uppercase text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800">
            {appointment.status}
          </span>
        </div>
      </div>

      {appointment.status === "cancelled" ? (
         <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
           Este agendamento foi cancelado.
         </div>
      ) : checkedIn ? (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="font-bold text-lg mb-1">✓ Check-in Realizado</div>
          <p className="text-sm">Seu profissional já foi notificado que você está a caminho ou aguardando.</p>
        </div>
      ) : (
        <>
          {isWarning && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4 text-sm font-bold animate-pulse">
              Atenção: Falta menos de 10 minutos para seu horário! Faça o check-in imediatamente ou seu horário poderá ser cancelado/repassado.
            </div>
          )}

          {canCheckIn ? (
            <button 
              onClick={handleCheckIn} 
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Fazer Check-in Agora"}
            </button>
          ) : (
             <div className="text-sm text-zinc-500 mt-4 p-4 border border-dashed rounded-xl dark:border-zinc-800">
               O botão de Check-in só será liberado 30 minutos antes do seu horário marcado. Salve este link.
             </div>
          )}
        </>
      )}

      <div className="mt-6">
        <a href={`/book/${slug}`} className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-100">
          Voltar a página principal
        </a>
      </div>
    </div>
  );
}
