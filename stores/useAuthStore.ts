import { AuthRole, AuthUser } from "@/types/auth";
import { getSafeStorage, removeCookie } from "@/utils/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clearAuthSession } from "@/services/auth.service";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  role: AuthRole | null;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isHydrated: false,
      setHydrated: (value) => set({ isHydrated: value }),
      setSession: ({ user, token }) => set({ user, token, role: user.role }),
      logout: () => {
        clearAuthSession();
        removeCookie("khidma_token");
        removeCookie("khidma_role");
        set({ user: null, token: null, role: null });
      },
    }),
    {
      name: "khidma-auth",
      storage: createJSONStorage(() => getSafeStorage()),
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
