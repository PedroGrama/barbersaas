"use client";

import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useRef } from "react";

export function DatePicker({ initialDate }: { initialDate: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Format YYYY-MM-DD to DD/MM/YYYY for display
  const displayDate = initialDate ? initialDate.split('-').reverse().join('/') : "--/--/----";

  return (
    <div className="relative group">
      <button 
        onClick={() => inputRef.current?.showPicker()}
        className="flex items-center gap-3 h-11 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-blue-500/50 transition-all shadow-sm group-hover:shadow-md"
      >
        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Data selecionada</span>
          <span className="text-xs font-black text-zinc-900 dark:text-white tracking-tight">{displayDate}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
      </button>

      <input
        ref={inputRef}
        type="date"
        defaultValue={initialDate}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/tenant?date=${e.target.value}`);
          }
        }}
        className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
      />
    </div>
  );
}
