"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, X, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface NotificationContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const handleConfirmResponse = (value: boolean) => {
    if (confirmModal) {
      confirmModal.resolve(value);
      setConfirmModal(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* ── TOASTS ── */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl p-4 shadow-2xl flex items-start gap-4 group relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 bottom-0 w-1" 
                style={{ backgroundColor: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : t.type === 'warning' ? '#f59e0b' : '#3b82f6' }} 
              />
              
              <div className={`mt-0.5 flex-shrink-0 ${t.type === 'success' ? 'text-green-500' : t.type === 'error' ? 'text-red-500' : t.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {t.type === 'error' && <XCircle className="w-5 h-5" />}
                {t.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {t.type === 'info' && <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1 pr-6">
                <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight tracking-tight uppercase tracking-tighter">
                  {t.type === 'success' ? 'Sucesso' : t.type === 'error' ? 'Erro' : t.type === 'warning' ? 'Atenção' : 'Aviso'}
                </p>
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{t.message}</p>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                className="absolute top-3 right-3 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── CONFIRM MODAL ── */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => handleConfirmResponse(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <HelpCircle className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                    {confirmModal.options.title || "Confirmar Ação"}
                  </h3>
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {confirmModal.options.message}
                  </p>
                </div>

                <div className="flex w-full gap-3 pt-4">
                  <button
                    onClick={() => handleConfirmResponse(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-transparent shadow-sm"
                  >
                    {confirmModal.options.cancelLabel || "Cancelar"}
                  </button>
                  <button
                    onClick={() => handleConfirmResponse(true)}
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-black/10"
                  >
                    {confirmModal.options.confirmLabel || "Confirmar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
}

// Para manter compatibilidade com useToast antigo enquanto refatoramos
export const useToast = useNotification;
