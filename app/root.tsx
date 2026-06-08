import "dayjs/locale/pl";
import "dayjs/locale/en";
import "dayjs/locale/uk";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/tiptap/styles.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { nprogress } from "@mantine/nprogress";
import * as Sentry from "@sentry/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import dayjs from "dayjs";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LinksFunction } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import { GlobalLayout } from "~/components/GlobalLayout";
import { CookieConsentProvider } from "~/context/CookieConsentContext";
import { CookiesContextProvider } from "~/context/CookiesContext";
import { FlashContextProvider } from "~/context/FlashContext";
import { useNonce } from "~/context/NonceContext";
import { useCookieConsent } from "~/hooks/useCookieConsent";
import { CookieConsent } from "~/ui/CookieConsent";

import { Route } from "./+types/root";
import { ErrorPage } from "./components/ErrorPage";
import { namespaces } from "./constants/namespaces";
import { ConfettiContextProvider } from "./context/ConfettiContext";
import { GlobalGeneratedModalContextProvider } from "./context/GlobalGeneratedModalContext";
import { LayoutContextProvider } from "./context/LayoutContext";
import { LoadingContextProvider } from "./context/LoadingContext";
import { SearchListingsContextProvider } from "./context/SearchListingsContext";
import { UserContextProvider } from "./context/UserContext";
import { UserCookieContextProvider } from "./context/UserCookieContext";
import { dynamic } from "./hoc/dynamic";
import { useLayout } from "./hooks/useLayout";
import { usePWA } from "./hooks/usePwa";
import { E_Language } from "./models/enums";
import stylesGlobal from "./styles/global.css?url";
import { theme } from "./styles/theme";

config.autoAddCss = false;

const AnalyticsScripts = ({ isProduction }: { isProduction: boolean }) => {
  const { analyticsConsent } = useCookieConsent();

  if (!isProduction || !analyticsConsent) {
    return null;
  }

  return (
    <>
      <SpeedInsights debug={false} />
      <Analytics debug={false} />
    </>
  );
};

const NavigationProgress = dynamic(() =>
  import("@mantine/nprogress").then(module => ({
    default: module.NavigationProgress,
  })),
);

const Notifications = dynamic(() =>
  import("@mantine/notifications").then(module => ({
    default: module.Notifications,
  })),
);

export const links: LinksFunction = () => {
  const isE2E = import.meta.env.VITE_IS_E2E === "true";
  const isProduction =
    !isE2E && import.meta.env.VITE_VERCEL_ENV === "production";

  return [
    { href: stylesGlobal, rel: "stylesheet" },
    { href: "https://fonts.gstatic.com", rel: "dns-prefetch" },
    {
      as: "font",
      crossOrigin: "anonymous",
      href: "/fonts/Inter-Bold.woff2",
      rel: "preload",
      type: "font/woff2",
    },
    {
      as: "font",
      crossOrigin: "anonymous",
      href: "/fonts/Inter-Regular.woff2",
      rel: "preload",
      type: "font/woff2",
    },
    { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
    ...(isProduction
      ? [{ href: "/manifest.webmanifest", rel: "manifest" }]
      : []),
  ];
};

function NavigationSideEffects() {
  const { state } = useNavigation();

  useEffect(() => {
    if (state === "idle") {
      nprogress.complete();
    } else {
      nprogress.start();
    }
  }, [state]);

  return null;
}

function Layout({ children }: Readonly<PropsWithChildren>) {
  const { platformColor } = useLayout();
  const { i18n, t } = useTranslation(namespaces.seo);
  const nonce = useNonce();

  const isE2E = import.meta.env.VITE_IS_E2E === "true";
  const isProduction =
    import.meta.env.VITE_VERCEL_ENV === "production" && !isE2E;

  useEffect(() => {
    dayjs.locale(i18n.language ?? E_Language.PL.toLowerCase());
  }, [i18n.language]);

  const mantineTheme = useMemo(
    () => theme({ primaryColor: platformColor }),
    [platformColor],
  );

  const datesSettings = useMemo(
    () => ({
      locale: i18n.language,
    }),
    [i18n.language],
  );

  return (
    <html
      data-mantine-color-scheme="light"
      dir={i18n.dir(i18n.language)}
      lang={i18n.language ?? E_Language.PL.toLowerCase()}
    >
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta content="#2563eb" name="theme-color" />
        <meta
          content="strict-origin-when-cross-origin"
          httpEquiv="Referrer-Policy"
        />
        <meta content="nosniff" httpEquiv="X-Content-Type-Options" />
        <Meta />
        <Links nonce={nonce} />
        <ColorSchemeScript defaultColorScheme="light" nonce={nonce} />
      </head>
      <body>
        <noscript>
          <link href={stylesGlobal} rel="stylesheet" />
        </noscript>
        <MantineProvider
          defaultColorScheme="light"
          getStyleNonce={() => nonce ?? ""}
          theme={mantineTheme}
        >
          <CookieConsentProvider>
            <DatesProvider settings={datesSettings}>
              <NavigationSideEffects />
              <SearchListingsContextProvider>
                <ConfettiContextProvider>
                  <CookiesContextProvider>
                    <GlobalGeneratedModalContextProvider>
                      <GlobalLayout>{children}</GlobalLayout>
                    </GlobalGeneratedModalContextProvider>
                  </CookiesContextProvider>
                </ConfettiContextProvider>
              </SearchListingsContextProvider>
              <CookieConsent />
              <NavigationProgress aria-label={t("imagesAlt.progressBar")} />
              <Notifications position="bottom-left" zIndex={3001} />
            </DatesProvider>
            <ScrollRestoration nonce={nonce} />
            <Scripts nonce={nonce} />
            <AnalyticsScripts isProduction={isProduction} />
          </CookieConsentProvider>
        </MantineProvider>
      </body>
    </html>
  );
}

const queryClient = new QueryClient();

const ExtraContextWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FlashContextProvider>
        <LoadingContextProvider>
          <UserCookieContextProvider>
            <UserContextProvider>
              <LayoutContextProvider>
                <Layout>{children}</Layout>
              </LayoutContextProvider>
            </UserContextProvider>
          </UserCookieContextProvider>
        </LoadingContextProvider>
      </FlashContextProvider>
    </QueryClientProvider>
  );
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (isRouteErrorResponse(error)) {
    return (
      <ExtraContextWrapper>
        <ErrorPage errorText={error} />
      </ExtraContextWrapper>
    );
  }

  Sentry.captureException(error);

  return (
    <ExtraContextWrapper>
      <ErrorPage />
    </ExtraContextWrapper>
  );
};

function AppWithPWA() {
  usePWA();

  return (
    <ExtraContextWrapper>
      <Outlet />
    </ExtraContextWrapper>
  );
}

function AppNoPWA() {
  return (
    <ExtraContextWrapper>
      <Outlet />
    </ExtraContextWrapper>
  );
}

const App = import.meta.env.VITE_IS_E2E === "true" ? AppNoPWA : AppWithPWA;
export default App;
