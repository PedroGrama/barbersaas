"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ToastProvider";
import { updateTenantSettings } from "./actions";
import { Globe, Image as ImageIcon, Instagram, Facebook, MessageCircle, Phone, CreditCard, Users, Save, Loader2 } from "lucide-react";

export function SettingsForm({ tenant }: { tenant: any }) {
  const { toast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(tenant.logoUrl || "");
  const router = useRouter();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast("A imagem deve ter no máximo 2MB.", "error");
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
      toast("Configurações atualizadas com sucesso!", "success");
      router.refresh();
    } catch (err: any) {
      toast("Erro: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm space-y-12">
        
        {/* 1. Informações Básicas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Informações Básicas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Estabelecimento</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={tenant.name || ""} 
                required 
                className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 text-sm dark:bg-zinc-950 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">URL de Agendamento</label>
              <div className="flex items-center group">
                <span className="h-12 px-4 flex items-center bg-zinc-50 dark:bg-zinc-800 border-y border-l border-zinc-200 dark:border-zinc-800 rounded-l-2xl text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                  bladehub.app/
                </span>
                <input 
                  type="text" 
                  name="slug" 
                  defaultValue={tenant.slug || ""} 
                  required 
                  className="flex-1 h-12 rounded-r-2xl border border-zinc-200 dark:border-zinc-800 px-4 text-sm dark:bg-zinc-950 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Identidade Visual */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Identidade Visual</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-3xl bg-zinc-50 dark:bg-white/2 border dark:border-white/5">
            <div className="relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white dark:border-zinc-800 shadow-2xl transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-24 h-24 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800 shadow-inner flex items-center justify-center text-zinc-400 font-black text-3xl">
                  {tenant.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900 hover:file:opacity-90 cursor-pointer transition-all"
              />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-60">PNG ou JPG até 2MB • Proporção 1:1 recomendada</p>
              {logoPreview && (
                <button 
                  type="button" 
                  onClick={() => setLogoPreview("")} 
                  className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors mt-2 inline-block"
                >
                  Remover Foto
                </button>
              )}
            </div>
            <input type="hidden" name="logoUrl" value={logoPreview} />
          </div>
        </div>

        {/* 3. Pagamentos */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Pagamentos</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Chave PIX (Manual)</label>
            <input 
              type="text" 
              name="pixKey" 
              defaultValue={tenant.pixKey || ""} 
              placeholder="CNPJ, CPF, Email ou Celular"
              className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 text-sm dark:bg-zinc-950 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-medium"
            />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-60 ml-1">Utilizada para pagamentos diretos via QR Code de mesa/balcão.</p>
          </div>
        </div>

        {/* 4. Preferências de Agendamento */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Preferências de Agendamento</h2>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
            <div className="pt-1">
              <input 
                type="checkbox" 
                name="allowChooseBarber" 
                id="allowChooseBarber"
                value="on"
                defaultChecked={tenant.allowChooseBarber === true} 
                className="w-5 h-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shadow-sm"
              />
            </div>
            <label htmlFor="allowChooseBarber" className="flex-1 cursor-pointer">
              <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">Permitir escolha de profissional</span>
              <span className="block text-xs text-zinc-500 mt-1">Se desmarcado, o sistema distribuirá os agendamentos automaticamente entre a equipe disponível.</span>
            </label>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tempo de Check-in (Minutos)</label>
            <input 
              type="number" 
              name="checkinMinutes" 
              defaultValue={tenant.checkinMinutes || 15}
              min={5}
              max={60} 
              required
              className="w-full h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 text-sm dark:bg-zinc-950 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-medium"
            />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-60 ml-1">Determine com quantos minutos de antecedência o botão de Check-in será liberado para o cliente (Padrão: 15 min).</p>
          </div>
        </div>
      </div>

      {/* Save Button Area */}
      <div className="pt-6 w-full flex justify-end">
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full sm:w-80 h-14 rounded-2xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-zinc-950/10 dark:shadow-none hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

    </form>
  );
}
