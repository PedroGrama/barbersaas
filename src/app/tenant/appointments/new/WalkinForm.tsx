"use client";

import { useState } from "react";
import { createWalkinAppointment } from "./actions";
import { useRouter } from "next/navigation";

export function WalkinForm({ tenantId, services, barbers, currentUserId, isAdmin }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("");
  const [barberId, setBarberId] = useState(isAdmin ? "" : currentUserId);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const toggleService = (id: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedServices(newSet);
  };

  const totalValue = Array.from(selectedServices).reduce((acc, id) => {
    return acc + (services.find((s: any) => s.id === id)?.basePrice || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.size === 0) return setError("Selecione pelo menos 1 serviço.");
    if (!barberId) return setError("Selecione o barbeiro responsável.");
    if (!time) return setError("Preencha a hora de início.");

    setLoading(true);
    setError("");

    try {
      await createWalkinAppointment({
        tenantId,
        clientName,
        clientPhone,
        dateStr: date,
        timeStr: time,
        barberId,
        serviceIds: Array.from(selectedServices)
      });
      router.push("/tenant");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Cliente</label>
          <input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Obrigatório" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone (Opcional se for avulso)</label>
          <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hora de Início</label>
          <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Barbeiro Designado</label>
          <select disabled={!isAdmin} required value={barberId} onChange={e => setBarberId(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800 disabled:opacity-50">
            <option value="">Selecione...</option>
            {barbers.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2 border-b dark:border-zinc-800 pb-2">Serviços que serão realizados</h3>
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          {services.map((s: any) => (
            <label key={s.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selectedServices.has(s.id) ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800' : 'border-zinc-200 dark:border-zinc-800'}`}>
              <input type="checkbox" checked={selectedServices.has(s.id)} onChange={() => toggleService(s.id)} className="rounded" />
              <span className="text-sm font-medium flex-1">{s.name}</span>
              <span className="text-sm text-zinc-500">R$ {s.basePrice.toFixed(2)}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 text-right font-medium">
          Total Base: R$ {totalValue.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t dark:border-zinc-800">
        <button type="button" onClick={() => router.push("/tenant")} className="rounded-xl px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancelar</button>
        <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-600/20">
          {loading ? "Salvando..." : "Confirmar Agendamento"}
        </button>
      </div>

    </form>
  );
}
