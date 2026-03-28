"use client";

import { useUiStore } from "@/stores/useUiStore";

export function useToast() {
  const pushToast = useUiStore((state) => state.pushToast);

  return {
    success(title: string, description?: string) {
      pushToast({ title, description, variant: "success" });
    },
    error(title: string, description?: string) {
      pushToast({ title, description, variant: "error" });
    },
    info(title: string, description?: string) {
      pushToast({ title, description, variant: "default" });
    },
  };
}
