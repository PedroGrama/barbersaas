"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto min-w-[320px] max-w-md bg-white border border-zinc-100 rounded-2xl p-4 shadow-xl shadow-black/5 flex items-start gap-3 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-green-500" style={{ backgroundColor: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#3b82f6' }} />
              
              <div className={`mt-0.5 flex-shrink-0 ${t.type === 'success' ? 'text-green-500' : t.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {t.type === 'error' && <XCircle className="w-5 h-5" />}
                {(t.type === 'info' || t.type === 'warning') && <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1 pr-6">
                <p className="text-sm font-semibold text-zinc-900 leading-tight">
                  {t.type === 'success' ? 'Sucesso' : t.type === 'error' ? 'Erro' : 'Informação'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{t.message}</p>
              </div>

              <button 
                onClick={() => removeToast(t.id)}
                className="absolute top-3 right-3 text-zinc-300 hover:text-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
