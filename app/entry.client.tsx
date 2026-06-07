import * as Sentry from "@sentry/react-router";
/* eslint-disable @typescript-eslint/ban-ts-comment */
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import i18next from "i18next";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import { NonceProvider } from "./context/NonceContext";
import i18n from "./localization/i18n";

const isDevelopment =
  import.meta.env.VITE_VERCEL_ENV === "development" ||
  import.meta.env.VITE_VERCEL_ENV === "preview";

Sentry.init({
  dsn: isDevelopment
    ? ""
    : "https://d9812cdd173751c6b5735096f58f961e@o4510770306154496.ingest.de.sentry.io/4510770317361232",
  enableLogs: !isDevelopment,
  environment: isDevelopment ? "development" : "production",
  integrations: [
    Sentry.reactRouterTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  replaysOnErrorSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  sendDefaultPii: false,
  tracePropagationTargets: [/^\//],
  tracesSampleRate: 1,
});

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.tz.setDefault("Europe/Warsaw");

const isTest =
  import.meta.env.MODE === "test" || import.meta.env.VITE_IS_E2E === "true";

async function main() {
  const language = document.documentElement.lang || "pl";

  await i18next.use(initReactI18next).init({
    ...i18n,
    lng: language,
  });

  if (isTest) {
    const originalT = i18next.t.bind(i18next);
    // @ts-ignore
    i18next.t = (...arguments_: unknown[]) => {
      const key = arguments_[0];
      // @ts-ignore
      return typeof key === "string" ? key : originalT(...arguments_);
    };
  }

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <NonceProvider nonce="">
          <StrictMode>
            <HydratedRouter />
          </StrictMode>
        </NonceProvider>
      </I18nextProvider>,
    );
  });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(error => console.error(error));

if (!isTest) {
  // Unregister any existing service worker to prevent double page reloads
  if (
    "serviceWorker" in navigator &&
    import.meta.env.VITE_VERCEL_ENV === "production"
  ) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  globalThis.addEventListener("beforeinstallprompt", (event: Event) => {
    // @ts-ignore
    globalThis.deferredPrompt = event;
  });
}
