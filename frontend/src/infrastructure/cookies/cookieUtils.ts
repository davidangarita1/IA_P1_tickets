export const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "auth_token";

const _parsedMaxAge = Number(process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE);
const AUTH_COOKIE_MAX_AGE =
  Number.isInteger(_parsedMaxAge) && _parsedMaxAge > 0 ? _parsedMaxAge : 86400;

export function setAuthCookie(token: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${AUTH_COOKIE_MAX_AGE}; path=/; SameSite=Strict${secure}`;
}

export function getAuthCookie(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === AUTH_COOKIE_NAME) {
      const value = rest.join("=");
      return value ? decodeURIComponent(value) : null;
    }
  }
  return null;
}

export function removeAuthCookie(): void {
  document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/`;
}
