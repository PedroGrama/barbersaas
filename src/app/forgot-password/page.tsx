"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking password reset flow
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">StudioFlow</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white mb-2">Recuperar Senha</h1>
                  <p className="text-zinc-500 text-sm">Digite seu email para receber um link de redefinição.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Cadastrado</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-sm text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-500 transition shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {loading ? "Processando..." : "Enviar Link de Acesso"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Email Enviado!</h2>
                <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                  Se o email <span className="text-zinc-300 font-bold">{email}</span> estiver cadastrado, você receberá instruções em instantes.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link href="/login" className="text-xs font-bold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Lembra sua senha? Entrar
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
