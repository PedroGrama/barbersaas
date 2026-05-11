"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Mail, Lock, ChevronRight, Loader2, ShieldCheck, ArrowLeft, Zap } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useMemo(() => params.get("next") ?? "", [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any;
        setError(data?.error ?? "Falha no login. Verifique seu email e senha.");
        return;
      }

      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      let redirectPath = "/";
      if (userData.role === "admin_geral") redirectPath = "/admin";
      else if (userData.role === "tenant_admin" || userData.role === "barbeiro") redirectPath = "/tenant";

      router.replace(next || redirectPath);
      router.refresh();
    } catch (err: any) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 font-sans selection:bg-blue-500/30">
      
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <div className="relative">
                <Scissors className="w-6 h-6 text-white" />
                <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">BladeHub</span>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Acesse sua conta</h2>
            <p className="text-sm text-zinc-500 font-medium tracking-tight">Gestão inteligente para barbearias e salões.</p>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/3 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-3xl overflow-hidden relative"
        >
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <form onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">E-mail Profissional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: seu@bladehub.com.br"
                  autoComplete="email"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Senha de Acesso</label>
                <Link href="/forgot-password" title="Não implementado neste demo" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition uppercase tracking-widest">
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white placeholder:text-zinc-700 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/50 transition-all font-bold"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3"
              >
                 <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                 <p className="text-xs font-bold text-red-400 leading-snug">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all overflow-hidden shadow-2xl shadow-blue-600/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Entrar no sistema
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Login Placeholder Removed */}
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <p className="text-xs text-zinc-500 font-bold tracking-tight">
               Não tem uma conta? <br/>
               <Link href="/register" className="text-white hover:underline decoration-blue-500 decoration-2 underline-offset-4">Começar agora gratuitamente</Link>
             </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-[0.2em] transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Retornar ao site
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
