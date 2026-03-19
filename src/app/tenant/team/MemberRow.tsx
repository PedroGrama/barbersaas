"use client";

import React, { useState } from "react";
import { toggleMemberActive, toggleIsBarber, deleteMember, forceResetPassword, editMember, promoteToAdmin } from "./actions";
import { 
  MoreVertical, ShieldCheck, Key, Trash2, 
  UserCog, ShieldAlert, CheckCircle2, AlertCircle, 
  Mail, User, Edit3, X, Save, Calendar
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export function MemberRow({ member, currentUserRole }: { member: any; currentUserRole: string }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name || "");
  const [editEmail, setEditEmail] = useState(member.email || "");
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const isAdmin = currentUserRole === "tenant_admin" || currentUserRole === "admin_geral";
  const canSuspend = isAdmin && member.role !== "tenant_admin" && member.role !== "admin_geral";
  const isOtherAdmin = member.role === "tenant_admin" || member.role === "admin_geral";

  const handleToggleActive = async () => {
    if (!canSuspend) return;
    setLoading(true);
    try {
      await toggleMemberActive(member.id, member.isActive);
      toast(`${member.name} agora está ${!member.isActive ? 'ativo' : 'suspenso'}.`, "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  const handleToggleIsBarber = async () => {
    setLoading(true);
    try {
      await toggleIsBarber(member.id, member.isBarber);
      toast(`Agenda do profissional ${!member.isBarber ? 'ativada' : 'desativada'}.`, "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir ${member.name}? Esta ação não pode ser desfeita.`)) {
      setLoading(true);
      try {
        await deleteMember(member.id);
        toast("Membro excluído com sucesso.", "success");
      } catch(e: any) {
        toast(e.message, "error");
        setLoading(false);
      }
    }
  };

  const handlePasswordReset = async () => {
    const pass = prompt(`Nova senha para ${member.name} (mínimo 6 caracteres):`);
    if (!pass) return;
    if (pass.length < 6) return toast("A senha precisa ter no mínimo 6 caracteres.", "error");
    setLoading(true);
    try {
      await forceResetPassword(member.id, pass);
      toast("Senha alterada com sucesso!", "success");
    } catch (e: any) {
      toast("Erro ao alterar senha: " + e.message, "error");
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!editName || !editEmail) return toast("Preencha todos os campos.", "error");
    setLoading(true);
    try {
      await editMember(member.id, editName, editEmail);
      toast("Dados do membro atualizados.", "success");
      setIsEditing(false);
    } catch(e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  const handlePromoteToAdmin = async () => {
    if (!confirm(`Promover ${member.name} a Admin? Ele terá acesso total ao painel gerenciador.`)) return;
    setLoading(true);
    try {
      await promoteToAdmin(member.id);
      toast(`${member.name} agora é um administrador.`, "success");
    } catch(e: any) {
      toast(e.message, "error");
    }
    setLoading(false);
  };

  if (isEditing) {
    return (
      <li className="relative p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[12px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-sans" 
                placeholder="Nome completo" 
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                value={editEmail} 
                onChange={e => setEditEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-100 dark:border-white/10 dark:bg-black text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-sans" 
                placeholder="Email corporativo" 
                type="email" 
              />
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 justify-end pt-2 sm:pt-0">
            <button disabled={loading} onClick={handleSaveEdit} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs hover:opacity-90 transition shadow-lg shadow-black/10">
              <Save className="w-3.5 h-3.5" /> Salvar
            </button>
            <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold text-xs hover:bg-zinc-200 dark:hover:bg-white/10 transition">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`group relative p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-blue-500/5 hover:border-blue-500/20 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Info Area */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-black border border-zinc-100 dark:border-white/5 flex items-center justify-center flex-shrink-0 relative shadow-inner">
            <User className="w-8 h-8 text-zinc-400" />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm transition-colors duration-500 ${member.isActive ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-black text-zinc-900 dark:text-white truncate text-xl tracking-tighter">{member.name}</h4>
              <div className="flex items-center gap-1.5">
                {isOtherAdmin && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-500/20">
                    Admin
                  </span>
                )}
                {member.isBarber && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                    Agenda Ativa
                  </span>
                )}
                {!member.isActive && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest border border-rose-500/20">
                    Suspenso
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-2 truncate">
               <Mail className="w-4 h-4 opacity-50" /> {member.email}
            </p>
          </div>
        </div>

        {/* Desktop Actions Area */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Main Status Actions */}
          <div className="flex items-center gap-3 pr-6 border-r border-zinc-100 dark:border-white/5">
            {canSuspend && (
              <button 
                onClick={handleToggleActive}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border transition-all duration-300 h-11 flex items-center justify-center ${
                  member.isActive 
                    ? 'hover:bg-rose-50 dark:hover:bg-rose-500/5 text-zinc-500 hover:text-rose-600 border-zinc-100 dark:border-white/5 hover:border-rose-500/20' 
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20 hover:bg-emerald-500'
                }`}
              >
                {member.isActive ? "Suspender" : "Ativar Membro"}
              </button>
            )}
            {!isOtherAdmin && (
              <button 
                onClick={handleToggleIsBarber}
                className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border transition-all duration-300 h-11 flex items-center justify-center ${
                  member.isBarber 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xl shadow-zinc-900/10 dark:shadow-white/5' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 hover:text-zinc-600'
                }`}
              >
                {member.isBarber ? "Agenda Ativa" : "Configurar Agenda"}
              </button>
            )}
          </div>

          {/* Management Icons */}
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button onClick={() => setIsEditing(true)} className="p-3 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all" title="Editar">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button onClick={handlePasswordReset} className="p-3 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all" title="Senha">
                  <Key className="w-5 h-5" />
                </button>
                {!isOtherAdmin && (
                  <>
                    <button onClick={handlePromoteToAdmin} className="p-3 rounded-2xl text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all" title="Promover Admin">
                      <ShieldCheck className="w-5 h-5" />
                    </button>
                    <button onClick={handleDelete} className="p-3 rounded-2xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Excluir">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Actions Overlay */}
        <div className="lg:hidden flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-white/5">
           <div className="flex items-center gap-3">
             <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${member.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                {member.isActive ? "Ativo" : "Inativo"}
             </div>
             {member.isBarber && (
               <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">Agenda</div>
             )}
           </div>
           
           <div className="relative">
             <button 
               onClick={() => setShowMenu(!showMenu)} 
               className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 active:scale-95 transition-all"
             >
               <MoreVertical className="w-6 h-6" />
             </button>
             
             {showMenu && (
               <div className="absolute right-0 bottom-full mb-4 w-60 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-white/10 rounded-[2rem] shadow-2xl p-3 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-4 duration-300">
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                    <Edit3 className="w-4 h-4" /> Editar Perfil
                  </button>
                  <button onClick={() => { handlePasswordReset(); setShowMenu(false); }} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                    <Key className="w-4 h-4" /> Alterar Senha
                  </button>
                  <button onClick={() => { handleToggleIsBarber(); setShowMenu(false); }} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                    <Calendar className="w-4 h-4" /> Alternar Agenda
                  </button>
                  {isAdmin && !isOtherAdmin && (
                    <>
                      <div className="h-[1px] bg-zinc-100 dark:bg-white/5 my-1" />
                      <button onClick={() => { handlePromoteToAdmin(); setShowMenu(false); }} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all">
                        <ShieldCheck className="w-4 h-4" /> Promover Admin
                      </button>
                      <button onClick={() => { handleDelete(); setShowMenu(false); }} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all">
                        <Trash2 className="w-4 h-4" /> Excluir Membro
                      </button>
                    </>
                  )}
               </div>
             )}
           </div>
        </div>
      </div>
    </li>
  );
}
