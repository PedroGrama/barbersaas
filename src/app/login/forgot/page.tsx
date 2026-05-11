import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ success?: string, error?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  if (resolvedSearchParams.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold mb-2">E-mail Enviado!</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <p className="text-xs text-zinc-400 mb-6 italic">
            (Nota do desenvolvedor: Olhe o terminal para ver o link gerado, pois não configuramos envio de e-mails reais no MVP).
          </p>
          <Link href="/login" className="block w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Voltar ao Login
          </Link>
        </div>
      </div>
    );
  }

  async function action(formData: FormData) {
    "use server";
    try {
      await requestPasswordReset(formData);
      redirect("/login/forgot?success=1");
    } catch (e: any) {
      redirect(`/login/forgot?error=${encodeURIComponent(e.message)}`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Esqueci minha senha</h1>
        
        {resolvedSearchParams.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {resolvedSearchParams.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="seu@email.com"
              className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>
          
          <button type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Enviar Link de Recuperação
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
            Lembrou da senha? Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
