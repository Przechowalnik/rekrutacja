/* eslint-disable no-undef */
import { reactRouter } from "@react-router/dev/vite";
import {
  sentryReactRouter,
  type SentryReactRouterBuildOptions,
} from "@sentry/react-router";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

const isDevelopmentOrTests = () => {
  const localEnvironment = (process.env.LOCAL_ENV ?? "").toLowerCase();
  return (
    process.env.CI === "true" ||
    process.env.E2E === "true" ||
    process.env.VITE_IS_E2E === "true" ||
    localEnvironment === "dev" ||
    localEnvironment === "test"
  );
};

const isPreview = () => {
  const localEnvironment = (process.env.VITE_VERCEL_ENV ?? "").toLowerCase();
  return localEnvironment === "preview";
};

const sentryConfig: SentryReactRouterBuildOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const setWebmanifestMime = {
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url?.endsWith(".webmanifest")) {
        response.setHeader("Content-Type", "application/manifest+json");
      }
      next();
    });
  },
  name: "set-webmanifest-mime",
} satisfies import("vite").Plugin;

const mockPwaRegister = {
  name: "mock-pwa-register",
  resolveId(id) {
    if (id === "virtual:pwa-register") {
      return id;
    }
  },
  load(id) {
    if (id === "virtual:pwa-register") {
      return `export function registerSW() { return () => {}; }`;
    }
  },
} satisfies import("vite").Plugin;

export default defineConfig(viteConfig => ({
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    target: "es2020",
  },

  optimizeDeps: {
    esbuildOptions: { target: "es2020" },
  },

  plugins: isDevelopmentOrTests()
    ? [mockPwaRegister, reactRouter(), tsconfigPaths()]
    : [
        setWebmanifestMime,
        VitePWA({
          devOptions: { enabled: false },
          includeAssets: [
            "favicon.svg",
            "robots.txt",
            "icons/apple-touch-icon.png",
            ".well-known/assetlinks.json",
          ],
          injectRegister: "auto",
          manifest: {
            description: "MaszBox PWA",
            display: "standalone",
            display_override: ["window-controls-overlay", "standalone"],
            icons: [
              {
                sizes: "16x16",
                src: "/icons/pwa-16x16.webp",
                type: "image/webp",
              },
              {
                sizes: "32x32",
                src: "/icons/pwa-32x32.webp",
                type: "image/webp",
              },
              {
                sizes: "48x48",
                src: "/icons/pwa-48x48.webp",
                type: "image/webp",
              },
              {
                sizes: "144x144",
                src: "/icons/pwa-144x144.webp",
                type: "image/webp",
              },
              {
                sizes: "180x180",
                src: "/icons/pwa-180x180.webp",
                type: "image/webp",
              },
              {
                sizes: "512x512",
                src: "/icons/pwa-512x512.png",
                type: "image/png",
              },
              {
                purpose: "maskable",
                sizes: "512x512",
                src: "/icons/pwa-512x512.png",
                type: "image/png",
              },
              {
                purpose: "any",
                sizes: "512x512",
                src: "/icons/pwa-512x512.png",
                type: "image/png",
              },
            ],
            id: "/",
            name: "MaszBox",
            protocol_handlers: [
              { protocol: "web+maszbox", url: "/handle-protocol?url=%s" },
            ],
            screenshots: [
              {
                form_factor: "wide",
                sizes: "1280x720",
                src: "/screenshots/home-wide.png",
                type: "image/png",
              },
              {
                form_factor: "narrow",
                sizes: "540x960",
                src: "/screenshots/home-mobile.png",
                type: "image/png",
              },
            ],
            short_name: "MaszBox",
            start_url: "/",
            theme_color: "#7950f2",
          },
          registerType: "prompt",
          selfDestroying: true,
          strategies: "generateSW",
        }),
        reactRouter(),
        tsconfigPaths(),
        viteCompression({ algorithm: "brotliCompress" }),
        viteCompression({ algorithm: "gzip" }),
        analyzer({ enabled: false }),
        process.env.SENTRY_AUTH_TOKEN && !isPreview()
          ? sentryReactRouter(sentryConfig, viteConfig)
          : null,
      ].filter(Boolean),
}));
