const ACCESS_TOKEN_COOKIE_NAME = 'khidma_access_token';
const DEFAULT_MAX_AGE = 900;

const isBrowser = typeof window !== 'undefined';

const maxAgeSeconds = (() => {
  const raw = process.env.NEXT_PUBLIC_ACCESS_TOKEN_MAX_AGE;
  if (!raw) return DEFAULT_MAX_AGE;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? DEFAULT_MAX_AGE : parsed;
})();

const getCookieOptions = (options: string[]) => {
  const secure = isBrowser && window.location.protocol === 'https:';
  const baseOptions = [...options, 'path=/', 'sameSite=lax'];
  if (secure) {
    baseOptions.push('secure');
  }
  return baseOptions.join('; ');
};

export function setAccessTokenCookie(token: string) {
  if (!isBrowser) return;
  const options = getCookieOptions([`max-age=${maxAgeSeconds}`]);
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; ${options}`;
}

export function clearAccessTokenCookie() {
  if (!isBrowser) return;
  const expires = new Date(0).toUTCString();
  const options = getCookieOptions([`max-age=0`, `expires=${expires}`]);
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; ${options}`;
}

export function getAccessTokenFromCookie() {
  if (!isBrowser) return null;
  const cookieString = document.cookie;
  if (!cookieString) return null;
  const match = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`));

  if (!match) return null;
  const value = match.substring(ACCESS_TOKEN_COOKIE_NAME.length + 1);
  return decodeURIComponent(value);
}

export { ACCESS_TOKEN_COOKIE_NAME };
