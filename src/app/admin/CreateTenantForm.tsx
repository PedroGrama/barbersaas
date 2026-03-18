"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Criar nova barbearia</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            placeholder="Barbearia XYZ"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Email admin</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            placeholder="admin@barbearia.com"
            type="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Senha</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            placeholder="********"
            type="password"
            required
          />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Criando…" : "Criar barbearia"}
      </button>
    </form>
  );
}
