"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { cn } from "@/utils/cn";

const iconMap = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  return (
    <div className="fixed right-3 top-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2 sm:right-4 sm:top-4 sm:w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.variant ?? "default"];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={cn(
                "rounded-2xl border border-black/10 bg-white p-4 shadow-lg",
                toast.variant === "error" && "border-black/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full border border-black/10 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm text-black/60">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full px-2 py-1 text-xs text-black/50 hover:bg-black/5"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
