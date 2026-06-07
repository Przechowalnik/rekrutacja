/* eslint-disable unicorn/prefer-global-this */
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushToDataLayer(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
  console.warn("[tracking]", event, data);
}

// --- Registration ---

export function trackCompleteRegistration(parameters?: {
  registrationType?: "company" | "companyWorker" | "user";
}): void {
  pushToDataLayer("complete_registration", {
    registration_type: parameters?.registrationType,
  });
}

// --- Listing ---

export function trackAddListing(parameters?: {
  listingType?: "company" | "user";
  requiresPayment?: boolean;
}): void {
  pushToDataLayer("add_listing", {
    listing_type: parameters?.listingType,
    requires_payment: parameters?.requiresPayment,
  });
}

// Push ViewContent into dataLayer with the same event_id used by Meta CAPI
// on the server. Configure the GTM Facebook Pixel tag to read `event_id`
// from dataLayer (variable name e.g. `DLV - event_id`) and pass it to the
// pixel as `eventID` — Meta dedupes server + client events with matching
// event_name and event_id within 48h.
export function trackViewContent(parameters: {
  contentCategory?: string;
  contentIds: string[];
  contentName?: string;
  currency?: string;
  eventId: string;
  value?: number;
}): void {
  pushToDataLayer("view_content", {
    content_category: parameters.contentCategory,
    content_ids: parameters.contentIds,
    content_name: parameters.contentName,
    content_type: "product",
    currency: parameters.currency ?? "PLN",
    event_id: parameters.eventId,
    value: parameters.value,
  });
}

// --- Track by flash message ---

export function trackByMessage(message: string): void {
  switch (message) {
    case "successRegistrationUser": {
      trackCompleteRegistration({ registrationType: "user" });
      break;
    }
    case "successRegistrationCompany": {
      trackCompleteRegistration({ registrationType: "company" });
      break;
    }
    case "successRegistrationCompanyWorker": {
      trackCompleteRegistration({ registrationType: "companyWorker" });
      break;
    }
    case "successCreateListing": {
      trackAddListing({ listingType: "user" });
      break;
    }
    case "successCreateListingCompany": {
      trackAddListing({ listingType: "company" });
      break;
    }
    case "successCreateListingToPay": {
      trackAddListing({ listingType: "user", requiresPayment: true });
      break;
    }
    case "successCreateListingCompanyToPay": {
      trackAddListing({ listingType: "company", requiresPayment: true });
      break;
    }
  }
}
