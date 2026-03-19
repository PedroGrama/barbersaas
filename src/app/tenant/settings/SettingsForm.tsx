"use client";

import { useState } from "react";
import { updateTenantSettings } from "./actions";
import { useRouter } from "next/navigation";

export function SettingsForm({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl || "");
  const router = useRouter();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTenantSettings(new FormData(e.currentTarget));
      alert("Configurações atualizadas com sucesso!");
      router.refresh();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Estabelecimento</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={tenant.name || ""} 
            required 
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL Pública (Slug)</label>
          <div className="flex items-center">
            <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-r-0 dark:border-zinc-700 rounded-l-xl text-sm text-zinc-500 font-bold">
              bladehub.app/book/
            </span>
            <input 
              type="text" 
              name="slug" 
              defaultValue={tenant.slug || ""} 
              required 
              className="flex-1 rounded-r-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Este será o link final enviado para os seus clientes.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-widest text-[10px]">Identidade Visual (Logo)</label>
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-white/2 border dark:border-white/5">
            <div className="relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-xl" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 shadow-inner flex items-center justify-center text-zinc-400 font-black text-2xl">
                  {tenant.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900 hover:file:opacity-90 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 font-medium">PNG ou JPG até 2MB. Recomendamos 400x400px.</p>
            </div>
            <input type="hidden" name="logoUrl" value={logoPreview} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chave PIX (Para receber pagamentos)</label>
          <input 
            type="text" 
            name="pixKey" 
            defaultValue={tenant.pixKey || ""} 
            placeholder="CNPJ, CPF, Email ou Celular"
            className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-800"
          />
          <p className="text-xs text-zinc-500 mt-1">Sua chave PIX que será mostrada no QRCode pós-atendimento.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox" 
            name="allowChooseBarber" 
            id="allowChooseBarber"
            defaultChecked={tenant.allowChooseBarber} 
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900"
          />
          <label htmlFor="allowChooseBarber" className="text-sm font-medium cursor-pointer">
            Permitir que o cliente escolha o profissional
          </label>
        </div>
        <p className="text-xs text-zinc-500 mb-4 pl-7">
          Se desmarcado, o sistema distribuirá os clientes automaticamente entre os profissionais de forma justa.
        </p>

      </div>

      <div className="pt-4 border-t dark:border-zinc-800">
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </form>
  );
}
