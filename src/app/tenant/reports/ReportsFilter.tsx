"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportsFilter({ currentStart, currentEnd, currentBarber, barbers, isAdmin }: any) {
  const router = useRouter();
  const [start, setStart] = useState(currentStart);
  const [end, setEnd] = useState(currentEnd);
  const [barber, setBarber] = useState(currentBarber);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (start) query.set("start", start);
    if (end) query.set("end", end);
    if (barber) query.set("barber", barber);

    router.push(`/tenant/reports?${query.toString()}`);
  };

  return (
    <form onSubmit={applyFilters} className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-auto">
        <label className="block text-xs font-medium text-zinc-500 mb-1">Data Início</label>
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
      </div>
      <div className="w-full md:w-auto">
        <label className="block text-xs font-medium text-zinc-500 mb-1">Data Fim</label>
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800" />
      </div>

      {isAdmin && (
        <div className="w-full md:w-auto min-w-[200px]">
          <label className="block text-xs font-medium text-zinc-500 mb-1">Barbeiro</label>
          <select value={barber} onChange={e => setBarber(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800">
            <option value="">Todos os barbeiros</option>
            {barbers.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className="w-full md:w-auto whitespace-nowrap rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
        Aplicar Filtros
      </button>
    </form>
  );
}
