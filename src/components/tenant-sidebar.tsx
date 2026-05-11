"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { 
  Calendar, CreditCard, Clock, Share2, 
  Palette, Scissors, Settings2, Users, 
  BarChart3, LifeBuoy, LogOut, UserCircle2,
  Menu, X, ChevronRight, LayoutDashboard,
  ZoomIn, ZoomOut, HelpingHand, Volume2
} from "lucide-react";

export function TenantSidebar({ 
  userRole, 
  userEmail, 
  userName,
  tenantName 
}: { 
  userRole: string; 
  userEmail: string; 
  userName: string;
  tenantName?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const pathname = usePathname();

  const toggle = () => setIsOpen(!isOpen);
  const isActive = (path: string) => {
    if (path === "/tenant") return pathname === "/tenant";
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoom + delta, 80), 150);
    setZoom(newZoom);
    document.documentElement.style.fontSize = `${newZoom}%`;
  };

  const menuGroups = [
    {
      label: "Geral",
      items: [
        { href: "/tenant", label: "Agenda", icon: Calendar },
        { href: "/tenant/payments", label: "Pagamentos", icon: CreditCard },
        { href: "/tenant/my-hours", label: "Meus Horários", icon: Clock },
      ]
    },
    ...(userRole === "tenant_admin" || userRole === "admin_geral" ? [{
      label: "Gestão",
      items: [
        { href: "/tenant/team", label: "Equipe", icon: Users },
        { href: "/tenant/services", label: "Serviços", icon: Scissors },
        { href: "/tenant/settings/hours", label: "Horário de Funcionamento", icon: Settings2 },
        { href: "/tenant/reports", label: "Relatórios", icon: BarChart3 },
      ]
    }, {
      label: "Configurações",
      items: [
        { href: "/tenant/settings", label: "Personalizar", icon: Palette },
        { href: "/tenant/share", label: "Divulgação", icon: Share2 },
        { href: "/tenant/billing", label: "Assinatura", icon: CreditCard },
      ]
    }] : [])
  ];

  return (
    <>
      <header className="md:hidden border-b bg-white/90 backdrop-blur-xl dark:bg-zinc-950/80 dark:border-white/5 p-4 flex justify-between items-center fixed top-0 w-full z-[100] h-16">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">{tenantName || "BladeHub"}</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[80] bg-zinc-950/20 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[90] w-72 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-white/5 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Branding Area */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-zinc-50 dark:border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[160px]">
              {tenantName || "Estabelecimento"}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Painel Profissional</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-4">
                {group.label}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative ${
                        active 
                        ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-500/5" 
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                      )}
                      <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? "text-blue-600 dark:text-blue-400" : ""}`} />
                      <span className="text-[13px] leading-none">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Professional Sidebar Footer */}
        <div className="mt-auto border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 px-4 pb-6 pt-6">
          
          {/* Acessibilidade & Tema (Unified Discrete Row) */}
          <div className="mb-6 space-y-4">
            <h3 className="px-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
              SISTEMA
            </h3>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                {/* Zoom Controls (Ghost Style) */}
                <div className="flex items-center gap-2 text-zinc-400">
                  <button onClick={() => handleZoom(-10)} className="hover:text-zinc-900 dark:hover:text-white transition-colors p-1">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold min-w-[24px] text-center">{zoom}%</span>
                  <button onClick={() => handleZoom(10)} className="hover:text-zinc-900 dark:hover:text-white transition-colors p-1">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-4 w-px bg-zinc-100 dark:bg-white/5" />
              </div>

              {/* Theme Toggle (Discrete) */}
              <ThemeToggle />
            </div>
          </div>

          {/* User Profile Section (Otimizada) */}
          <div className="flex items-center gap-3 px-2 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform hover:scale-105">
               <UserCircle2 className="w-6 h-6 text-zinc-400" />
            </div>
            
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <Link href="/tenant/profile" className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 truncate hover:text-blue-600 transition-colors">
                   {userName || "Perfil"}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Sair">
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
              <span className="text-[10px] text-zinc-500 truncate font-medium -mt-0.5 tracking-tight" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
