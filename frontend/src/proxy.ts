import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_WINDOW = 10_000;
const RATE_MAX = 25;
const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);

const store = new Map<string, { count: number; time: number }>();

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string, now: number): boolean {
  const entry = store.get(ip);

  if (entry && now - entry.time < RATE_WINDOW) {
    entry.count++;
    return entry.count > RATE_MAX;
  }

  store.set(ip, { count: 1, time: now });
  return false;
}

function cleanExpiredEntries(now: number): void {
  for (const [ip, data] of store.entries()) {
    if (now - data.time > RATE_WINDOW * 3) {
      store.delete(ip);
    }
  }
}

function applySecurityHeaders(res: NextResponse): void {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "";
  const wsProtocolUrl = wsUrl.replace(/^http/, "ws");
  const isDev = process.env.NODE_ENV === "development";

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      `connect-src 'self' ${wsUrl} ${wsProtocolUrl}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
}

export function proxy(req: NextRequest) {
  const now = Date.now();
  cleanExpiredEntries(now);

  const ip = getClientIP(req);

  if (isRateLimited(ip, now)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  if (!ALLOWED_METHODS.has(req.method)) {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }

  const res = NextResponse.next();
  applySecurityHeaders(res);
  return res;
}

export const proxyConfig = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sounds).*)"],
};
