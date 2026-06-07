/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import * as Sentry from "@sentry/react-router";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

import { NonceProvider } from "./context/NonceContext";
import { buildCSPHeader, generateNonce } from "./data/nonce.server";
import { applyRateLimit } from "./data/security.server";
import i18n from "./localization/i18n";
import i18nextConfig from "./localization/i18n.server";
import { E_Language } from "./models/enums";

export const handleError = Sentry.createSentryHandleError({
  logErrors: false,
});

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Warsaw");

export const streamTimeout = 5000;

const isTest =
  import.meta.env.MODE === "test" || import.meta.env.VITE_IS_E2E === "true";

async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext,
) {
  await applyRateLimit({
    forceBlankPage: true,
    request,
  });

  // Generate unique nonce for this request
  const nonce = generateNonce();

  // Set CSP header with nonce
  responseHeaders.set("Content-Security-Policy", buildCSPHeader(nonce));

  const instance = createInstance();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ns = i18nextConfig.getRouteNamespaces(routerContext as any);

  const url = new URL(request.url);
  const locale =
    url.pathname.startsWith(`/${E_Language.EN.toLowerCase()}/`) ||
    url.pathname === `/${E_Language.EN.toLowerCase()}`
      ? E_Language.EN.toLowerCase()
      : E_Language.PL.toLowerCase();

  // Set current language cookie for API redirects (works for anonymous users too)
  responseHeaders.append(
    "Set-Cookie",
    `currentLang=${locale}; Path=/; SameSite=Lax; Max-Age=3600; HttpOnly; Secure`,
  );

  await instance.use(initReactI18next).init({
    ...i18n,
    lng: locale,
    ns,
  });

  if (isTest) {
    const originalT = instance.t.bind(instance);
    // @ts-ignore
    instance.t = (...arguments_: unknown[]) => {
      const key = arguments_[0];
      // @ts-ignore
      return typeof key === "string" ? key : originalT(...arguments_);
    };
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    const { abort, pipe } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <NonceProvider nonce={nonce}>
          <ServerRouter
            context={routerContext}
            nonce={nonce}
            url={request.url}
          />
        </NonceProvider>
      </I18nextProvider>,
      {
        nonce,
        onError(error: unknown) {
          responseStatusCode = 500; // NOSONAR
          if (shellRendered) {
            console.error(error);
          }
        },
        onShellError(error: unknown) {
          reject(error);
        },
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(Sentry.getMetaTagTransformer(body));
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}

export default Sentry.wrapSentryHandleRequest(handleRequest);
