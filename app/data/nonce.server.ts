import { randomBytes } from "node:crypto";

/**
 * Generate a cryptographically secure nonce for CSP
 * Returns a base64-encoded 16-byte random value
 */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

/**
 * Build Content-Security-Policy header value with nonce
 * Uses 'strict-dynamic' so scripts loaded by a nonce-tagged script are trusted
 */
export function buildCSPHeader(nonce: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  // Base directives
  const directives: Record<string, string[]> = {
    "base-uri": ["'self'"],
    // Connect sources (fetch, XHR, WebSocket)
    "connect-src": [
      "'self'",
      "https://vercel.live",
      "https://va.vercel-scripts.com",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://stats.g.doubleclick.net",
      "https://www.googletagmanager.com",
      "https://*.clarity.ms",
      "https://www.clarity.ms",
      "https://scripts.clarity.ms",
      "https://c.clarity.ms",
      "https://s.clarity.ms",
      "https://e.clarity.ms",
      "https://api.cookiebot.com",
      "https://consent.cookiebot.com",
      "https://consentcdn.cookiebot.com",
      "https://imgsct.cookiebot.com",
      "https://api.brevo.com",
      "https://*.hostedsms.pl",
      "https://api.stat.gov.pl",
      "https://api.stripe.com",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      "https://graph.facebook.com",
      "https://*.facebook.com",
      "https://*.facebook.net",
      "https://*.run.app",
      "https://analytics.tiktok.com",
      "https://ct.tiktok.com",
      "https://business-api.tiktok.com",
      "https://*.tiktok.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://places.googleapis.com",
      "https://*.ingest.sentry.io",
      "https://sentry.io",
      "https://*.sentry.io",
    ],
    "default-src": ["'self'"],
    // Font sources
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "form-action": [
      "'self'",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      "https://*.facebook.com",
      "https://*.facebook.net",
      "https://*.run.app",
      "https://analytics.tiktok.com",
      "https://ct.tiktok.com",
      "https://*.tiktok.com",
    ],

    "frame-ancestors": ["'self'"],

    // Frame sources
    "frame-src": [
      "'self'",
      "https://vercel.live",
      "https://www.googletagmanager.com",
      "https://*.clarity.ms",
      "https://www.clarity.ms",
      "https://scripts.clarity.ms",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://*.supabase.co",
      "https://consentcdn.cookiebot.com",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      "https://*.tiktok.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://places.googleapis.com",
    ],

    // Image sources
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://maszbox.pl",
      "https://vercel.live",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://*.clarity.ms",
      "https://www.clarity.ms",
      "https://c.clarity.ms",
      "https://s.clarity.ms",
      "https://c.bing.com",
      "https://stats.g.doubleclick.net",
      "https://js.stripe.com",
      "https://*.stripe.com",
      "https://*.brevo.com",
      "https://*.supabase.co",
      "https://imgsct.cookiebot.com",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      "https://*.facebook.com",
      "https://*.facebook.net",
      "https://analytics.tiktok.com",
      "https://ct.tiktok.com",
      "https://*.tiktok.com",
      "https://www.gstatic.com",
      "https://fonts.gstatic.com",
      "https://www.google.com",
      "https://*.google.com",
      "https://*.googleapis.com",
      "https://tile.openstreetmap.org",
      "https://*.tile.openstreetmap.org",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://places.googleapis.com",
    ],

    "object-src": ["'none'"],

    // Script sources - nonce + strict-dynamic
    // strict-dynamic: scripts loaded by a nonce'd script are automatically trusted
    // 'unsafe-inline' is a fallback ignored by browsers that support nonce
    // https: is a fallback ignored by browsers that support strict-dynamic
    "script-src": [
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "'unsafe-inline'",
      "https:",
    ],

    // Style sources - Mantine requires 'unsafe-inline'
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://www.googletagmanager.com",
    ],

    // Worker sources
    "worker-src": ["'self'", "blob:"],
  };

  // Add upgrade-insecure-requests in production
  if (isProduction) {
    directives["upgrade-insecure-requests"] = [];
  }

  // Build CSP string
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}
