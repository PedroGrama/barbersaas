"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Lock, ShieldCheck, Camera, Check, ShieldAlert, BadgeCheck, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { updateProfile, updatePassword } from "./actions";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: any;
  tenant: any;
  isAdmin: boolean;
}

export default function ProfileForm({ user, tenant, isAdmin }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Profile state
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Password Strength logic
  const [strength, setStrength] = useState(0);
  useEffect(() => {
    let s = 0;
    if (newPassword.length > 6) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    setStrength(s);
  }, [newPassword]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, email, logoUrl });
      toast("Perfil atualizado com sucesso!", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("As senhas não coincidem", "error");
      return;
    }
    if (strength < 2) {
      toast("A nova senha é muito fraca", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast("Senha atualizada com sucesso!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="flex flex-col gap-10 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Informações Básicas e Branding */}
      <section className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Coluna do Avatar */}
          <div className="flex flex-col items-center gap-6 w-full md:w-64">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Meu Avatar</h3>
            
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-zinc-100 dark:bg-white/5 border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                   <div className="text-zinc-300"><User className="w-12 h-12" /></div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-white dark:border-zinc-900">
                 <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form de Dados Pessoais */}
          <form onSubmit={handleUpdateProfile} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
               <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Informações Pessoais</h3>
               <p className="text-xs text-zinc-500 font-medium mt-1">Atualize seus dados de contato e nome de exibição.</p>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome de Exibição</label>
               <div className="relative group">
                 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   required
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full h-12 pl-11 pr-4 rounded-2xl border border-zinc-100 dark:border-white/10 dark:bg-black font-bold text-[13px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
                 />
                 <BadgeCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-0 group-focus-within:opacity-100 transition-all" />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
               <div className="relative group">
                 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                 <input 
                   required
                   type="email"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full h-12 pl-11 pr-4 rounded-2xl border border-zinc-100 dark:border-white/10 dark:bg-black font-bold text-[13px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all"
                 />
               </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-zinc-50 dark:border-white/5">
              <button 
                 disabled={isSavingProfile}
                 type="submit"
                 className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Segurança e Senha */}
      <section className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleUpdatePassword} className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-1 border-r border-zinc-50 dark:border-white/5 pr-8">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" /> Segurança
              </h3>
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-4 space-y-2">
                 Dicas de senha:<br/>
                 • Mínimo 7 caracteres<br/>
                 • Letra maiúscula<br/>
                 • Caracter especial
              </p>
           </div>

           <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha Atual</label>
                    <input 
                       required
                       type="password"
                       value={currentPassword}
                       onChange={e => setCurrentPassword(e.target.value)}
                       autoComplete="current-password"
                       className="w-full h-11 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nova Senha</label>
                    <input 
                       required
                       type="password"
                       value={newPassword}
                       onChange={e => setNewPassword(e.target.value)}
                       autoComplete="new-password"
                       className="w-full h-11 px-4 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                    {/* Visual Strength Meter */}
                    <div className="flex gap-1 mt-2">
                       {[0,1,2,3].map((i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              i < strength 
                                ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-amber-500' : 'bg-green-500') 
                                : 'bg-zinc-100 dark:bg-white/10'
                            }`}
                          />
                       ))}
                    </div>
                    <div className="flex items-center justify-between px-1">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${
                          strength < 2 ? 'text-red-500' : strength < 4 ? 'text-amber-500' : 'text-green-500'
                       }`}>
                          {strength < 2 ? 'Insegura' : strength < 4 ? 'Média' : 'Muito Forte'}
                       </span>
                       {strength >= 4 && <Check className="w-3 h-3 text-green-500" />}
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirmar Senha</label>
                    <input 
                       required
                       type="password"
                       value={confirmPassword}
                       onChange={e => setConfirmPassword(e.target.value)}
                       autoComplete="new-password"
                       className={`w-full h-11 px-4 rounded-xl border font-medium text-sm outline-none focus:ring-2 transition-all ${
                          confirmPassword && confirmPassword !== newPassword 
                             ? 'border-red-400 bg-red-50/10 focus:ring-red-500/20' 
                             : 'border-zinc-100 dark:border-white/10 dark:bg-black focus:ring-blue-500/30'
                       }`}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                       <span className="text-[10px] font-bold text-red-500 px-1 flex items-center gap-1 mt-1 animate-pulse">
                          <ShieldAlert className="w-3 h-3" /> As senhas não batem
                       </span>
                    )}
                 </div>
              </div>

              <div className="flex justify-start">
                <button 
                   disabled={isSavingPassword || !newPassword || strength < 2}
                   type="submit"
                   className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  ATUALIZAR SENHA
                </button>
              </div>
           </div>
        </form>
      </section>

    </div>
  );
}
