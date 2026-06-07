import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/react-router";

const isDevelopment = process.env.VITE_VERCEL_ENV === "development";

Sentry.init({
  // Set up performance monitoring
  beforeSend(event) {
    // Filter out 404s from error reporting
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (
        error?.type === "NotFoundException" ||
        error?.value?.includes("404")
      ) {
        return null;
      }
    }
    return event;
  },
  dsn: "https://d9812cdd173751c6b5735096f58f961e@o4510770306154496.ingest.de.sentry.io/4510770317361232",

  // Enable logs to be sent to Sentry
  enableLogs: !isDevelopment,
  environment: isDevelopment ? "development" : "production",

  integrations: [nodeProfilingIntegration()],
  profilesSampleRate: 1, // profile every transaction

  sendDefaultPii: false,
  tracesSampleRate: 1, // Capture 100% of the transactions
});
