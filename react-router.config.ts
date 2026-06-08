import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";
import { vercelPreset } from "@vercel/react-router/vite";

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

const getAllCitiesSlug = async () => {
  try {
    const { database } = await import("./app/data/database.server"); // no create new connections to db, when is not used

    const cities = await database.city.findMany({
      orderBy: {
        name: "desc",
      },
      select: {
        nameSearch: true,
      },
    });

    return cities.map(item => item.nameSearch);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getAllCityDistrictSlugs = async () => {
  try {
    const { database } = await import("./app/data/database.server");

    const districts = await database.district.findMany({
      orderBy: {
        name: "desc",
      },
      select: {
        city: {
          select: {
            nameSearch: true,
          },
        },
        nameSearch: true,
      },
    });

    return districts.map(item => `${item.city.nameSearch}/${item.nameSearch}`);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default {
  buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
    try {
      if (isDevelopmentOrTests() || isPreview()) {
        return;
      }

      await sentryOnBuildEnd({ buildManifest, reactRouterConfig, viteConfig });
    } catch (error) {
      console.error("sentryOnBuildEnd failed:", error);
    }
  },
  async prerender() {
    if (isDevelopmentOrTests()) {
      return [];
    }

    const citiesSlugs = await getAllCitiesSlug();
    const cityDistrictSlugs = await getAllCityDistrictSlugs();

    const polishPages = [
      "/",
      "/dostepnosc",
      "/o-nas",
      "/blad",
      "/blad-konto-nie-znalezione",
      "/blad-logowanie-facebook",
      "/blad-logowanie-google",
      "/blad-logowanie-haslo",
      "/pomoc",
      "/kontakt",
      "/odzyskaj-konto-email-zapasowy",
      "/odzyskaj-konto-zmien-haslo",
      "/odzyskaj-konto",
      "/logowanie",
      "/rejestracja",
      "/rejestracja/konto",
      "/rejestracja/firma",
      "/konto",
      "/firma",
      "/szukaj",
      "/szukaj/strychy",
      "/szukaj/piwnice",
      "/szukaj/kontenery",
      "/szukaj/garaze-miejsca-postojowe",
      "/szukaj/dzialki",
      "/szukaj/pokoje",
      "/szukaj/komorki-lokatorskie",
      "/szukaj/lokale",
      "/szukaj/magazyn",
      "/miasta",
      "/jak-dodac-ogloszenie",
      ...citiesSlugs.map(slug => `/miasta/${slug}`),
      ...cityDistrictSlugs.map(slug => `/miasta/${slug}`),
    ];

    const englishPages = polishPages.map(path =>
      path === "/" ? "/en" : `/en${path}`,
    );

    return [...polishPages, ...englishPages];
  },
  presets: isDevelopmentOrTests() ? [] : [vercelPreset()],
  ssr: true,
} satisfies Config;
