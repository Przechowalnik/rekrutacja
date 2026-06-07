import { createHash, randomUUID } from "node:crypto";

import { waitUntil } from "@vercel/functions";

import { getCookieValue } from "./cookies.server";
import { environment } from "./environment.server";
import { formatAmountOnlyNumber } from "./stripe.server";

const META_API_VERSION = "v21.0";
const META_REQUEST_TIMEOUT_MS = 2000;

// Subset of Meta CAPI standard event names we support. Full list:
// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
export type T_MetaCapiEventName =
  | "AddToCart"
  | "CompleteRegistration"
  | "Contact"
  | "InitiateCheckout"
  | "Lead"
  | "PageView"
  | "Purchase"
  | "Search"
  | "Subscribe"
  | "ViewContent";

// Plaintext user data — will be normalised + SHA-256 hashed before sending.
// See https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
export type T_MetaCapiUserData = {
  city?: string;
  country?: string;
  email?: string;
  externalId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  zipCode?: string;
};

export type T_MetaCapiCustomData = {
  content_category?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: "destination" | "flight" | "hotel" | "product" | "vehicle";
  contents?: Array<{
    id: string;
    item_price?: number;
    quantity?: number;
  }>;
  currency?: string;
  num_items?: number;
  search_string?: string;
  value?: number;
};

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const normaliseEmail = (value: string) => value.trim().toLowerCase();

const normalisePhone = (value: string) => value.replaceAll(/\D/g, "");

const normaliseName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll(/[^A-Za-zÀ-ſ]/g, "");

const normaliseLocation = (value: string) => value.trim().toLowerCase();

const hashIfPresent = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  return sha256(value);
};

// Build the hashed user_data payload required by CAPI.
// Identifiers (em/ph/fn/ln/ct/zp/country/external_id) MUST be SHA-256 hashed.
// fbp/fbc/client_ip_address/client_user_agent MUST NOT be hashed.
const buildHashedUserData = ({
  city,
  country,
  email,
  externalId,
  fbc,
  fbp,
  firstName,
  ipAddress,
  lastName,
  phone,
  userAgent,
  zipCode,
}: T_MetaCapiUserData & {
  fbc?: string;
  fbp?: string;
  ipAddress?: string;
  userAgent?: string;
}): Record<string, string | undefined> => ({
  client_ip_address: ipAddress,
  client_user_agent: userAgent,
  country: hashIfPresent(country ? normaliseLocation(country) : undefined),
  ct: hashIfPresent(city ? normaliseLocation(city) : undefined),
  em: hashIfPresent(email ? normaliseEmail(email) : undefined),
  external_id: hashIfPresent(externalId?.trim().toLowerCase()),
  fbc,
  fbp,
  fn: hashIfPresent(firstName ? normaliseName(firstName) : undefined),
  ln: hashIfPresent(lastName ? normaliseName(lastName) : undefined),
  ph: hashIfPresent(phone ? normalisePhone(phone) : undefined),
  zp: hashIfPresent(zipCode?.trim().toLowerCase()),
});

const omitUndefined = <T extends Record<string, unknown>>(input: T): T => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out as T;
};

// Generate a new event_id (UUID v4). Pass the same id to both the client-side
// Pixel and server-side CAPI calls so Meta deduplicates the event.
export const generateMetaEventId = (): string => randomUUID();

// Build a deterministic _fbp value from IP + UA hash. Used when no real
// Pixel-set _fbp cookie exists (ad-blocker, first-ever visit before Pixel
// loads). Meta accepts any value in the standard `fb.{subdomain}.{ts}.{int}`
// format as a valid identifier — same IP+UA produces the same fbp across
// visits, giving Meta a stable per-device key.
const buildSyntheticFbp = (ipAddress: string, userAgent: string): string => {
  const hash = createHash("sha256")
    .update(`${ipAddress}|${userAgent}`)
    .digest("hex");
  const numericChunk = Number.parseInt(hash.slice(0, 13), 16);
  return `fb.1.0.${numericChunk}`;
};

// Extract Meta-relevant data from the incoming Request. Reads:
//  - _fbp / _fbc cookies (set by Facebook Pixel JS, identify the browser)
//  - X-Forwarded-For / client IP
//  - User-Agent header
// fbclid (URL param) is converted to fbc cookie format if present and no _fbc.
// When _fbp cookie is missing (ad-blocker, pre-Pixel-load), a deterministic
// fbp is built from IP+UA so events still pass Meta's match-quality checks.
export const getMetaSignalsFromRequest = (request: Request) => {
  const cookieHeader = request.headers.get("cookie");
  let fbp = getCookieValue(cookieHeader, "_fbp") ?? undefined;
  let fbc = getCookieValue(cookieHeader, "_fbc") ?? undefined;

  if (!fbc) {
    const url = new URL(request.url);
    const fbclid = url.searchParams.get("fbclid");
    if (fbclid) {
      // Standard fbc format: fb.{subdomain_index}.{creation_timestamp}.{fbclid}
      // subdomain_index = 1 for top-level domain (eg maszbox.pl).
      fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  if (!fbp && ipAddress && userAgent) {
    fbp = buildSyntheticFbp(ipAddress, userAgent);
  }

  return { fbc, fbp, ipAddress, userAgent };
};

type T_SendMetaCapiEventParameters = {
  customData?: T_MetaCapiCustomData;
  eventId?: string;
  eventName: T_MetaCapiEventName;
  eventSourceUrl: string;
  eventTime?: number;
  request: Request;
  userData?: T_MetaCapiUserData;
};

// Sends a single event to Meta Conversions API.
// - Non-blocking: errors are logged but never thrown to the caller.
// - Hard-disabled outside production: localhost has no x-forwarded-for so
//   Meta rejects events as "too broad" (error 2804050), and any successful
//   event would pollute the live Pixel.
// - Skipped silently if META_PIXEL_ID or META_ACCESS_TOKEN are unset.
// - 2s timeout — slow Meta endpoint cannot block the user response.
export const sendMetaCapiEvent = async ({
  customData,
  eventId,
  eventName,
  eventSourceUrl,
  eventTime,
  request,
  userData,
}: T_SendMetaCapiEventParameters): Promise<void> => {
  try {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const pixelId = environment("META_PIXEL_ID");
    const accessToken = environment("META_ACCESS_TOKEN");
    const testEventCode = environment("META_TEST_EVENT_CODE");

    if (!pixelId || !accessToken) {
      return;
    }

    const signals = getMetaSignalsFromRequest(request);

    // Meta rejects events with only IP+UA as "too broad" (error 2804050).
    // When no caller-provided identifier and no _fbp/_fbc cookies are present,
    // build a stable per-device external_id from IP+UA so anonymous users
    // (ad-blockers, first-ever visits) still produce valid events.
    const hasIdentifier =
      Boolean(userData?.externalId) ||
      Boolean(userData?.email) ||
      Boolean(userData?.phone) ||
      Boolean(signals.fbp) ||
      Boolean(signals.fbc);
    const fallbackExternalId =
      !hasIdentifier && signals.ipAddress && signals.userAgent
        ? `anon:${signals.ipAddress}|${signals.userAgent}`
        : undefined;

    const hashedUserData = omitUndefined(
      buildHashedUserData({
        ...userData,
        ...signals,
        ...(fallbackExternalId ? { externalId: fallbackExternalId } : {}),
      }),
    );

    const event = omitUndefined({
      action_source: "website",
      custom_data: customData ? omitUndefined(customData) : undefined,
      event_id: eventId ?? generateMetaEventId(),
      event_name: eventName,
      event_source_url: eventSourceUrl,
      event_time: eventTime ?? Math.floor(Date.now() / 1000),
      user_data: hashedUserData,
    });

    const body = omitUndefined({
      data: [event],
      test_event_code: testEventCode,
    });

    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      META_REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(
          `[meta-capi] ${eventName} failed: ${response.status}`,
          text.slice(0, 500),
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if ((error as { name?: string })?.name === "AbortError") {
      console.warn(
        `[meta-capi] ${eventName} timed out after ${META_REQUEST_TIMEOUT_MS}ms`,
      );
      return;
    }
    console.error(`[meta-capi] ${eventName} threw:`, error);
  }
};

// Fire-and-forget wrapper. Use when you don't want to `await` the CAPI call
// in a critical path (eg. inside a loader that should respond fast).
// `waitUntil` from @vercel/functions extends the function execution past the
// response — without it Vercel may kill the pending promise before the CAPI
// fetch completes, dropping events non-deterministically. Outside Vercel
// (eg. local dev) `waitUntil` falls back to a regular setTimeout.
export const sendMetaCapiEventInBackground = (
  parameters: T_SendMetaCapiEventParameters,
): void => {
  waitUntil(sendMetaCapiEvent(parameters));
};

// =============================================================================
// Domain-specific event helpers
// =============================================================================
// Each helper wraps `sendMetaCapiEventInBackground` with the right shape for
// a single business action. Call sites just pass the resource — all field
// mapping, hashing, fbp/fbc extraction, etc. live in this module.

export type T_MetaCapiListing = {
  category?: null | string;
  id?: string;
  location?: {
    city?: { name?: null | string } | null;
  } | null;
  price?: bigint | number | string;
  slug?: null | string;
  title?: null | string;
};

// ViewContent — fire from `getListing` loader. Returns the generated event_id
// so it can be forwarded to the client and pushed into the dataLayer for
// client/server Pixel deduplication. Returns null when no content id is known.
// Pass `userData` (userId/firstName/lastName) when the user is logged in so
// Meta can match the event — without it CAPI rejects events from anonymous
// users that have no _fbp cookie yet (eg. ad-blocker, first-ever pageview).
export const fireMetaListingViewEvent = ({
  listing,
  request,
  userData,
}: {
  listing: T_MetaCapiListing;
  request: Request;
  userData?: T_MetaCapiUserData;
}): null | string => {
  const contentId = listing.slug ?? listing.id;
  if (!contentId) {
    return null;
  }

  const url = new URL(request.url);
  let priceValue: number | undefined;
  if (listing.price !== undefined && listing.price !== null) {
    const numericPrice =
      typeof listing.price === "string" ? Number(listing.price) : listing.price;
    priceValue = formatAmountOnlyNumber(numericPrice);
  }
  const eventId = generateMetaEventId();

  sendMetaCapiEventInBackground({
    customData: {
      content_category: listing.category ?? undefined,
      content_ids: [contentId],
      content_name: listing.title ?? undefined,
      content_type: "product",
      contents: [
        {
          id: contentId,
          ...(priceValue ? { item_price: priceValue } : {}),
          quantity: 1,
        },
      ],
      currency: "PLN",
      ...(priceValue ? { value: priceValue } : {}),
    },
    eventId,
    eventName: "ViewContent",
    eventSourceUrl: url.toString(),
    request,
    ...(userData ? { userData } : {}),
  });

  return eventId;
};

// Lead — fire when a user reveals seller contact info / clicks "show phone".
export const fireMetaLeadEvent = ({
  listingId,
  request,
  userId,
}: {
  listingId: string;
  request: Request;
  userId?: null | string;
}): void => {
  const url = new URL(request.url);
  sendMetaCapiEventInBackground({
    customData: {
      content_ids: [listingId],
      content_type: "product",
    },
    eventName: "Lead",
    eventSourceUrl: url.toString(),
    request,
    ...(userId ? { userData: { externalId: userId } } : {}),
  });
};

// Search — fire from `getListingsSearch` loader.
export const fireMetaSearchEvent = ({
  category,
  city,
  numResults,
  request,
  userData,
}: {
  category: string;
  city: string;
  numResults?: number;
  request: Request;
  userData?: T_MetaCapiUserData;
}): void => {
  const url = new URL(request.url);
  sendMetaCapiEventInBackground({
    customData: {
      content_category: category,
      search_string: `${category} ${city}`.trim(),
      ...(typeof numResults === "number" ? { num_items: numResults } : {}),
    },
    eventName: "Search",
    eventSourceUrl: url.toString(),
    request,
    ...(userData ? { userData } : {}),
  });
};

// CompleteRegistration — fire from signUp / signUpCompany actions.
export const fireMetaRegistrationEvent = ({
  email,
  firstName,
  lastName,
  registrationType,
  request,
  userId,
}: {
  email?: null | string;
  firstName?: null | string;
  lastName?: null | string;
  registrationType: "company" | "companyWorker" | "user";
  request: Request;
  userId: string;
}): void => {
  const url = new URL(request.url);
  sendMetaCapiEventInBackground({
    customData: { content_category: registrationType },
    eventName: "CompleteRegistration",
    eventSourceUrl: url.toString(),
    request,
    userData: {
      email: email ?? undefined,
      externalId: userId,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    },
  });
};

// InitiateCheckout — fire when Stripe checkout session is created. `amount`
export const fireMetaInitiateCheckoutEvent = ({
  amount,
  currency,
  email,
  listingId,
  request,
  userId,
}: {
  amount: bigint | number;
  currency?: null | string;
  email?: null | string;
  listingId: string;
  request: Request;
  userId: string;
}): void => {
  const url = new URL(request.url);
  const value = formatAmountOnlyNumber(amount);
  const normalizedCurrency = (currency ?? "pln").toUpperCase();
  sendMetaCapiEventInBackground({
    customData: {
      content_ids: [listingId],
      content_type: "product",
      contents: [{ id: listingId, item_price: value, quantity: 1 }],
      currency: normalizedCurrency,
      num_items: 1,
      value,
    },
    eventName: "InitiateCheckout",
    eventSourceUrl: url.toString(),
    request,
    userData: {
      email: email ?? undefined,
      externalId: userId,
    },
  });
};

// Purchase — fire from Stripe webhook (`checkout.session.completed`).
// `amount` is the gross amount in the smallest currency subunit (1 PLN = 100),
// same convention as Stripe and Prisma `listing.price`. The helper
// `formatAmountOnlyNumber` converts it to the main unit for the Meta payload.
export const fireMetaPurchaseEvent = ({
  amount,
  currency,
  email,
  eventSourceUrl,
  firstName,
  lastName,
  listingId,
  request,
  userId,
}: {
  amount: bigint | number;
  currency?: null | string;
  email?: null | string;
  eventSourceUrl: string;
  firstName?: null | string;
  lastName?: null | string;
  listingId: string;
  request: Request;
  userId: string;
}): void => {
  const value = formatAmountOnlyNumber(amount);
  const normalizedCurrency = (currency ?? "pln").toUpperCase();
  sendMetaCapiEventInBackground({
    customData: {
      content_ids: [listingId],
      content_type: "product",
      contents: [{ id: listingId, item_price: value, quantity: 1 }],
      currency: normalizedCurrency,
      num_items: 1,
      value,
    },
    eventName: "Purchase",
    eventSourceUrl,
    request,
    userData: {
      email: email ?? undefined,
      externalId: userId,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    },
  });
};
