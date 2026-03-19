import Link from "next/link";
import { Scissors, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl opacity-50" />

      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-10 rotate-12 shadow-2xl">
          <Scissors className="w-12 h-12 text-zinc-500" />
        </div>
        <div className="absolute -top-4 -right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
          404
        </div>
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        <h1 className="text-4xl font-black text-white tracking-tighter">Página Não Encontrada</h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          O endereço que você digitou não existe ou foi movido. <br />
          Tente voltar para o início ou verifique o link.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link 
          href="/" 
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition shadow-xl shadow-white/5"
        >
          <Home className="w-4 h-4" /> Início
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-zinc-300 hover:bg-white/10 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>

      <footer className="pt-12">
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">StudioFlow © 2026</p>
      </footer>
    </div>
  );
}
