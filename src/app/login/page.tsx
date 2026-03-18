"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useMemo(() => params.get("next") ?? "", [params]);

  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("admin123");
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
        setError(data?.error ?? "Falha no login");
        return;
      }

      // Buscar informações do usuário logado para redirecionamento automático
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      let redirectPath = "/";
      if (userData.role === "admin_geral") {
        redirectPath = "/admin";
      } else if (userData.role === "tenant_admin" || userData.role === "barbeiro") {
        redirectPath = "/tenant";
      }

      router.replace(next || redirectPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">BarberSaaS</h1>
          <p className="mt-2 text-sm text-zinc-600">Entre na sua conta</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-900">Email</label>
              <input
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-900">Senha</label>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900 mb-3">Contas de teste:</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600">Admin Geral:</span>
              <button
                onClick={() => {
                  setEmail("admin@local");
                  setPassword("admin123");
                }}
                className="text-zinc-900 hover:underline"
              >
                admin@local / admin123
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Admin Tenant:</span>
              <button
                onClick={() => {
                  setEmail("tenant@local");
                  setPassword("tenant123");
                }}
                className="text-zinc-900 hover:underline"
              >
                tenant@local / tenant123
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Barbeiro:</span>
              <button
                onClick={() => {
                  setEmail("barbeiro@local");
                  setPassword("barber123");
                }}
                className="text-zinc-900 hover:underline"
              >
                barbeiro@local / barber123
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">BarberSaaS</h1>
          <p className="mt-2 text-sm text-zinc-600">Carregando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

