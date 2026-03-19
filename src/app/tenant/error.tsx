"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from "lucide-react";

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to an observability service in a real app
    console.error("Layout Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-[32px] p-10 shadow-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 shadow-xl shadow-amber-500/10">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Opa! Algo deu errado.</h2>
          <p className="text-zinc-500 text-sm font-medium mt-2 leading-relaxed">
            Houve um problema ao carregar esta página. Não se preocupe, você ainda está logado.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <RefreshCcw className="w-4 h-4" /> Tentar Novamente
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.back()}
              className="h-12 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <button
              onClick={() => router.push("/tenant")}
              className="h-12 border border-zinc-200 dark:border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              <Home className="w-3.5 h-3.5" /> Início
            </button>
          </div>
        </div>

        {error.digest && (
          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            ID do Erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
