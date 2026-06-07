import { Redis } from "@upstash/redis";

const EDGE_RATE_LIMIT = 60;
const EDGE_RATE_WINDOW = 60;

const DEFAULT_LOCALE = "pl";
const SUPPORTED_LOCALES = new Set(["pl", "en"]);
const LOCALE_COOKIE = "lng";

let redis: null | Redis = null;

function getRedis(): null | Redis {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    return null;
  }

  redis = new Redis({ token, url });
  return redis;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

async function hashIp(ip: string): Promise<string> {
  const pepper = process.env.IP_HASH_PEPPER ?? "dev-only";

  const data = new TextEncoder().encode(`${pepper}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

const RATE_LIMITED_PATHS = [
  "/api/login",
  "/api/recovery-account",
  "/api/recovery-account-backup-email",
  "/api/recovery-account-change-password",
  "/recovery-account-reset-2fa",
  "/api/registration/account",
  "/api/registration/company",
  "/api/autocomplete/address",
  "/api/autocomplete/city",
  "/api/search",
  "/api/searchMap",
];

function shouldRateLimit(request: Request): boolean {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.startsWith("/api/") && request.method !== "GET") {
    return true;
  }

  for (const prefix of RATE_LIMITED_PATHS) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

function getLocaleFromCookie(request: Request): null | string {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === LOCALE_COOKIE && value && SUPPORTED_LOCALES.has(value)) {
      return value;
    }
  }
  return null;
}

function getLocaleFromAcceptLanguage(request: Request): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const languages = acceptLanguage
    .split(",")
    .map(lang => {
      const [code, q = "q=1"] = lang.trim().split(";");
      const langCode = code?.split("-")[0]?.toLowerCase() ?? "";
      return {
        code: langCode,
        quality: Number.parseFloat(q.split("=")[1] ?? "1") || 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (code && SUPPORTED_LOCALES.has(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

function handleLocaleRedirect(request: Request): Response | undefined {
  const url = new URL(request.url);
  const { origin, pathname, search } = url;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/webhooks/") ||
    pathname.startsWith("/_") ||
    pathname.includes(".") ||
    pathname === "/sitemap.xml" ||
    pathname === "/collect/g/collect"
  ) {
    return undefined;
  }

  const isEnglishPath = pathname.startsWith("/en/") || pathname === "/en";
  const cookieLocale = getLocaleFromCookie(request);
  const browserLocale = getLocaleFromAcceptLanguage(request);
  const preferredLocale = cookieLocale || browserLocale;

  if (isEnglishPath && preferredLocale === "pl" && !cookieLocale) {
    const newPath = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    const redirectUrl = new URL(newPath + search, origin);
    return Response.redirect(redirectUrl.toString(), 302);
  }

  if (!isEnglishPath && preferredLocale === "en" && !cookieLocale) {
    const newPath = pathname === "/" ? "/en" : `/en${pathname}`;
    const redirectUrl = new URL(newPath + search, origin);
    return Response.redirect(redirectUrl.toString(), 302);
  }

  return undefined;
}

export default async function middleware(
  request: Request,
): Promise<Response | undefined> {
  const localeRedirect = handleLocaleRedirect(request);
  if (localeRedirect) {
    return localeRedirect;
  }

  if (!shouldRateLimit(request)) {
    return undefined;
  }

  const client = getRedis();
  if (!client) {
    return undefined;
  }

  const ip = getClientIp(request);
  const ipHash = await hashIp(ip);

  const key = `edge_rl:${ipHash}`;

  try {
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, EDGE_RATE_WINDOW);
    }

    if (count > EDGE_RATE_LIMIT) {
      return Response.json(
        { error: "Too Many Requests" },
        {
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json",
            "Retry-After": String(EDGE_RATE_WINDOW),
          },
          status: 429,
        },
      );
    }
  } catch {
    // fail-open
  }

  return undefined;
}

export const config = {
  matcher: ["/api/:path*"],
};
