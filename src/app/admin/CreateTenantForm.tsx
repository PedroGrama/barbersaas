"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Store, Mail, Lock } from "lucide-react";

export function CreateTenantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as any;
        setError(data?.error ?? "Erro ao criar tenant");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6 rounded-3xl border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl h-full"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
          <Plus className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">Novo Estabelecimento</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Store className="w-3 h-3" /> Nome do Negócio
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              placeholder="Ex: BladeHub Barber"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email do Administrador
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              placeholder="admin@exemplo.com"
              type="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3" /> Senha Inicial
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              placeholder="********"
              type="password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          {loading ? "Processando..." : (
            <>
              Criar Estabelecimento <Plus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
