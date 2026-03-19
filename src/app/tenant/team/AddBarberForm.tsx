"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export function AddBarberForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tenant/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviar campo isAdmin se for True
        body: JSON.stringify({ tenantId, name, email, password, role: makeAdmin ? "tenant_admin" : "barbeiro" }),
      });
      
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Erro ao adicionar profissional");

      toast("Profissional adicionado com sucesso!", "success");
      setName("");
      setEmail("");
      setPassword("");
      setMakeAdmin(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 font-sans">
      <div className="space-y-1.5 flex flex-col">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nome Completo</label>
        <div className="relative group">
          <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            required 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ex: João Silva"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="space-y-1.5 flex flex-col">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail de Login</label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            required 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="joao@exemplo.com"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="space-y-1.5 flex flex-col">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Senha Temporária</label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            required 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium" 
          />
        </div>
      </div>

      <div className="flex flex-col justify-end pb-1">
        <label className="flex items-center gap-3 cursor-pointer group select-none h-11 px-4 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/2 hover:bg-zinc-100 transition-all duration-200">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={makeAdmin} 
              onChange={e => setMakeAdmin(e.target.checked)} 
            />
            <div className="w-10 h-5 bg-zinc-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Dar acesso de Administrador</span>
            <span className="text-[10px] text-zinc-500">Poderá editar horários e equipe.</span>
          </div>
          <ShieldCheck className={`w-4 h-4 ml-auto transition-colors ${makeAdmin ? 'text-blue-500' : 'text-zinc-400'}`} />
        </label>
      </div>

      <div className="md:col-span-2 pt-2">
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 dark:shadow-white/5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Adicionando...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Cadastrar Profissional
            </>
          )}
        </button>
      </div>
    </form>
  );
}
