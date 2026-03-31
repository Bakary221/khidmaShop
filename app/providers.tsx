"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { loadUserProfile } from "@/services/auth.service";
import { refreshTokens } from "@/services/api.client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const handleLoad = () => {
      loadUserProfile().catch(() => {
        useAuthStore.getState().setUser(null);
      });
    };

    if (token) {
      handleLoad();
      return;
    }

    refreshTokens()
      .catch(() => {
        useAuthStore.getState().clearSession();
      });
  }, [isHydrated, token]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" reverseOrder={false} gutter={12} />
    </QueryClientProvider>
  );
}
