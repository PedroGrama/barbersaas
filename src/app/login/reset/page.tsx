import { resetPassword } from "./actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string, error?: string } }) {
  if (!searchParams.token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">Link inválido ou expirado.</div>
      </div>
    );
  }

  async function action(formData: FormData) {
    "use server";
    try {
      await resetPassword(formData);
      redirect("/login?reset=success");
    } catch (e: any) {
      redirect(`/login/reset?token=${searchParams.token}&error=${encodeURIComponent(e.message)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Criar Nova Senha</h1>
        
        {searchParams.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {searchParams.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={searchParams.token} />
          
          <div>
            <label className="block text-sm font-medium mb-1">Nova Senha</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6}
              className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required 
              minLength={6}
              className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>
          
          <button type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Salvar Senha
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}
