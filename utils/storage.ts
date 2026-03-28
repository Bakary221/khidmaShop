const memoryStorage: Storage = {
  length: 0,
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
};

export function getSafeStorage() {
  if (typeof window === "undefined") {
    return memoryStorage;
  }

  return window.localStorage;
}

export function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}
