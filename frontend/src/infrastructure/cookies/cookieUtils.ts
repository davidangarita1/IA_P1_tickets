export const AUTH_COOKIE_NAME = "auth_token";

export function setAuthCookie(token: string): void {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
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
