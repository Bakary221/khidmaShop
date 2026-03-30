import { AuthUser } from '@/types/auth';
import { create } from 'zustand';
import { clearAccessTokenCookie, getAccessTokenFromCookie } from '@/services/token-cookie';
import { decodeJwt } from '@/utils/jwt';

const removeStaleAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('khidma-auth');
};

const getExpirationFromToken = (token: string | null) => {
  if (!token) return null;
  const payload = decodeJwt<{ exp?: number }>(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

removeStaleAuthStorage();

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  accessTokenExpiresAt: number | null;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearSession: () => void;
};

const initialToken = getAccessTokenFromCookie();

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: initialToken,
  accessTokenExpiresAt: getExpirationFromToken(initialToken),
  isHydrated: true,
  setHydrated: (value) => set({ isHydrated: value }),
  setToken: (token) =>
    set({
      token,
      accessTokenExpiresAt: getExpirationFromToken(token),
    }),
  setUser: (user) => set({ user }),
  clearSession: () => {
    clearAccessTokenCookie();
    set({ user: null, token: null, accessTokenExpiresAt: null });
  },
}));
