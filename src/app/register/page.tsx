"use client";

import { motion } from "framer-motion";
import { Scissors, CheckCircle2, ArrowRight, Building2, User, Mail, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/components/ToastProvider";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useNotification();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Registration logic would go here
    setTimeout(() => {
        setLoading(false);
        toast("Em breve: Registro de novos tenants estará disponível!", "info");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col items-center"
      >
        <Link href="/" className="flex items-center gap-3 font-black text-3xl tracking-tighter text-white mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          BladeHub
        </Link>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter text-center max-w-xl leading-tight uppercase italic">
          Gestão Profissional para o seu <span className="text-blue-500">negócio</span>.
        </h1>
      </motion.header>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Benefits */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col gap-8"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Por que escolher o BladeHub?</h2>
            <p className="text-zinc-500 font-medium">Junte-se a milhares de estabelecimentos que transformaram sua gestão.</p>
          </div>

          <div className="space-y-6">
            {[
              { title: "Ativação Rápida", desc: "Seu salão online e pronto para receber agendamentos em minutos." },
              { title: "Design Premium", desc: "Uma interface profissional que transmite a escala do seu negócio." },
              { title: "Gestão Inteligente", desc: "Controle total de horários, equipe e faturamento sem complicação." },
            ].map((b, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight uppercase italic">{b.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5">
             <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                   ))}
                </div>
                <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  +4.500 Barber Shop parceiras
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Seu Nome</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Pedro Grama"
                      className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all"
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Nome do Estabelecimento</label>
                 <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: BladeHub Barber"
                      className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all"
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">E-mail Profissional</label>
              <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                 <input 
                   required
                   type="email" 
                   placeholder="seu@email.com"
                   className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all"
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Senha de Acesso</label>
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                   <input 
                     required
                     type="password" 
                     placeholder="••••••••"
                     className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">WhatsApp de Contato</label>
                <div className="relative group">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                   <input 
                     required
                     type="tel" 
                     placeholder="(11) 99999-9999"
                     className="w-full bg-white/2 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:border-blue-500/50 focus:bg-white/5 outline-none transition-all"
                   />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white rounded-[2rem] py-5 text-base font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? "Processando..." : <>Começar Agora Grátis <ArrowRight className="w-5 h-5" /></>}
            </button>

            <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Ao clicar, você aceita nossos <Link href="#" className="text-blue-500 underline">Termos</Link> e <Link href="#" className="text-blue-500 underline">Privacidade</Link>.
            </p>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mr-2">Já tem uma conta?</span>
            <Link href="/login" className="text-xs font-black text-white hover:text-blue-400 transition italic uppercase">
              Fazer Login
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
