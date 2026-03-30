import { useAuthStore } from '@/stores/useAuthStore';
import { getAccessTokenFromCookie, setAccessTokenCookie } from '@/services/token-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export class ApiError extends Error {
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.details = details;
  }
}

let refreshPromise: Promise<void> | null = null;

const REFRESH_MARGIN_MS = 30_000;

async function ensureValidAccessToken() {
  const state = useAuthStore.getState();
  if (!state.token || !state.accessTokenExpiresAt) return;
  const shouldRefresh = Date.now() + REFRESH_MARGIN_MS >= state.accessTokenExpiresAt;
  if (!shouldRefresh) return;
  await refreshTokens();
}

async function refreshTokens() {
  if (!BASE_URL) {
    throw new ApiError('Paramètres API manquants');
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      useAuthStore.getState().setToken(null);
      useAuthStore.getState().setUser(null);
      throw new ApiError(payload?.message ?? 'Session expirée');
    }

    const data = payload?.data;
    if (!data?.accessToken) {
      throw new ApiError('Impossible de rafraîchir la session');
    }

    useAuthStore.getState().setToken(data.accessToken);
    setAccessTokenCookie(data.accessToken);
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function buildQuery(params?: RequestOptions['params']) {
  if (!params) return '';
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
  return query ? `?${query}` : '';
}

function getStoredToken() {
  const token = useAuthStore.getState().token;
  if (token) {
    return token;
  }

  const cookieToken = getAccessTokenFromCookie();
  if (cookieToken) {
    useAuthStore.getState().setToken(cookieToken);
  }

  return cookieToken;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(options.params)}`;
  const headers: Record<string, string> = options.body && !(options.body instanceof FormData)
    ? { 'Content-Type': 'application/json' }
    : {};

  if (!options.skipAuth) {
    await ensureValidAccessToken();
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | undefined),
    credentials: 'include',
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401 && !options.skipRefresh && !options.skipAuth) {
    await refreshTokens();
    return request(path, { ...options, skipRefresh: true });
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.message || 'Une erreur est survenue';
    const details = payload?.error?.details;
    throw new ApiError(message, details);
  }

  return payload?.data ?? payload;
}
