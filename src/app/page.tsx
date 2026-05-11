"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, CalendarCheck, TrendingUp, ShieldCheck, ChevronRight, CheckCircle2, Zap, Users, Star, ArrowRight, ShieldAlert, Play } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-blue-500/30 overflow-hidden text-zinc-100">

      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-600/20">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            BladeHub
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Funcionalidades</a>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition">
              Entrar
            </Link>
            <Link href="/register" className="text-sm font-black bg-white text-zinc-950 px-6 py-2.5 rounded-full hover:bg-zinc-200 transition shadow-xl shadow-white/5">
              Começar Agora
            </Link>
          </nav>
          {/* Mobile CTA */}
          <Link href="/register" className="md:hidden text-xs font-black bg-blue-600 text-white px-5 py-2.5 rounded-full">
            Acessar
          </Link>
        </div>
      </header>

      <main className="pt-20">

        {/* ── HERO ── */}
        <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-48 text-center">

          {/* Background gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[120px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            A Nova Era da Gestão de Estética
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto mb-8"
          >
            Sua agenda no <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-sm">
              piloto automático.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            O BladeHub é o sistema definitivo para barbearias e salões que buscam excelência. Configuração em minutos, para você focar no que realmente importa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link href="/register" className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full text-base font-black hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 active:scale-95">
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full text-base font-bold hover:bg-white/10 transition backdrop-blur-sm">
              Ver Funcionalidades
            </a>
          </motion.div>

          {/* Dashboard Mockup Section (Animated Preview) */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-24 relative mx-auto max-w-6xl group p-4"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            
            <div className="relative rounded-[28px] border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
               <div className="flex h-10 items-center px-5 gap-2 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md relative z-10">
                 <div className="w-3 h-3 rounded-full bg-red-500/40" />
                 <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                 <div className="w-3 h-3 rounded-full bg-green-500/40" />
                 <div className="ml-4 h-4 w-32 bg-white/5 rounded-full" />
               </div>
               
               {/* Simulated Video UI */}
               <div className="relative aspect-video flex items-center justify-center overflow-hidden bg-zinc-900">
                  <motion.div 
                    animate={{ scale: [1, 1.02, 1], rotate: [0, 0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 z-0 p-8"
                  >
                    <img 
                      src="/images/dashboard-mockup.png" 
                      alt="Premium Dashboard Mockup" 
                      className="w-full h-full object-cover rounded-xl brightness-[0.7] contrast-[1.1] blur-[2px] group-hover:blur-0 transition-all duration-700" 
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none z-10" />
                  
                  {/* Play Overlay */}
                  <div className="relative z-20 flex flex-col items-center gap-6">
                     <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-8 h-8 text-white fill-white" />
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-white uppercase tracking-[0.3em]">Preview em Vídeo</span>
                        <div className="w-48 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                           <motion.div 
                             animate={{ x: ["-100%", "100%"] }}
                             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                             className="w-1/2 h-full bg-blue-600 rounded-full" 
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* ── STATS ── */}
        <section className="border-y border-white/5 bg-white/2 py-20 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center"
              {...stagger}
            >
              {[
                { value: "40k+", label: "Sucesso Absoluto" },
                { value: "99.8%", label: "Estabilidade" },
                { value: "Segundos", label: "Agendamentos" },
                { value: "24/7", label: "Gestão Ativa" },
              ].map((s) => (
                <motion.div key={s.value} {...fadeUp}>
                  <div className="text-4xl font-black text-white tracking-tighter mb-2">{s.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div className="text-center max-w-3xl mx-auto mb-24" {...fadeUp}>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">Gestão simplificada, <br/>resultados extraordinários.</h2>
              <p className="mt-6 text-zinc-400 text-lg font-medium leading-relaxed">Cada detalhe do BladeHub foi pensado para economizar seu tempo e encantar seus clientes.</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8" {...stagger}>
              {[
                {
                  icon: CalendarCheck,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10 border-blue-500/20",
                  title: "Página de Agendamento",
                  desc: "Seus clientes agendam em segundos, sem precisar baixar apps. Interface mobile-first fluida e profissional.",
                },
                {
                  icon: TrendingUp,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                  title: "Financeiro Inteligente",
                  desc: "Fluxo de caixa em tempo real. Saiba exatamente quanto faturou por dia, semana ou mês com clareza total.",
                },
                {
                  icon: ShieldCheck,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10 border-amber-500/20",
                  title: "Controle de Equipe",
                  desc: "Gerencie permissões, ordene seus profissionais e tenha logs detalhados de cada alteração no sistema.",
                },
                {
                  icon: Zap,
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10 border-indigo-500/20",
                  title: "Multi-Unidades",
                  desc: "Gerencie vários estabelecimentos com uma única conta admin. Isolamento total e branding personalizado.",
                },
                {
                  icon: Users,
                  color: "text-rose-400",
                  bg: "bg-rose-500/10 border-rose-500/20",
                  title: "CRM do Cliente",
                  desc: "Histórico completo, preferências e notificações. Construa lealdade através de um atendimento personalizado.",
                },
                {
                  icon: Star,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10 border-yellow-500/20",
                  title: "Branding de Luxo",
                  desc: "Sua logo, suas cores, sua marca. O sistema se adapta para refletir a qualidade única do seu serviço.",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group bg-white/2 hover:bg-white/5 border border-white/5 p-8 rounded-3xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${f.bg} border rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-7 h-7 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-40 relative overflow-hidden group">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/luxury-barber.png" 
              alt="Luxury Experience" 
              className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-[2000ms] scale-110 group-hover:scale-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div {...fadeUp} className="mb-8 flex justify-center">
               <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  Oferta Limitada
               </div>
            </motion.div>
            <motion.h2 {...fadeUp} className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-tight">
              A excelência começa com a escolha certa.
            </motion.h2>
            <motion.p {...fadeUp} className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Não perca mais tempo com planilhas e agendas de papel. <br/>
              <span className="text-white font-bold">Escalabilidade, segurança e design premium.</span>
            </motion.p>
            <motion.div {...fadeUp} className="flex flex-col items-center gap-6">
              <Link href="/register" className="px-12 py-6 rounded-full bg-white text-zinc-950 text-lg font-black hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-3">
                Começar Teste de 30 Dias
                <Scissors className="w-5 h-5" />
              </Link>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-4">
                 <span><CheckCircle2 className="w-4 h-4 text-blue-500 inline mr-1" /> Fácil de usar</span>
                 <span><CheckCircle2 className="w-4 h-4 text-blue-500 inline mr-1" /> Ativação rápida</span>
                 <span><CheckCircle2 className="w-4 h-4 text-blue-500 inline mr-1" /> Sem complicação</span>
              </p>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
                <Scissors className="w-6 h-6 text-blue-500" />
                BladeHub
              </div>
              <p className="text-zinc-600 text-sm max-w-xs text-center md:text-left font-medium">
                Elevando o padrão da gestão estética através de design e tecnologia.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Produto</span>
                <a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition">Agenda</a>
                <a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition">Relatórios</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Suporte</span>
                <a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition">Central de Ajuda</a>
                <a href="mailto:contato@bladehub.app" className="text-sm font-bold text-zinc-400 hover:text-white transition">Contato</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Legal</span>
                <a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition">Privacidade</a>
                <a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition">Termos</a>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">
               © {new Date().getFullYear()} BLADEHUB SAAS. ALL RIGHTS RESERVED.
             </p>
             <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-black">
                FEITO COM <Star className="w-3 h-3 text-blue-500 inline fill-blue-500" /> PARA O MERCADO PREMIUM
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
