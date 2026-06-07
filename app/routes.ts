import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
  type RouteConfigEntry,
} from "@react-router/dev/routes";

const nonLocalizedRoutes: RouteConfigEntry[] = [
  route("sitemap.xml", "./pages/sitemap.ts"),
  route("sitemap-pages.xml", "./pages/sitemap-pages.ts"),
  route("sitemap-cities.xml", "./pages/sitemap-cities.ts"),
  route("sitemap-categories.xml", "./pages/sitemap-categories.ts"),
  route("sitemap-blog.xml", "./pages/sitemap-blog.ts"),
  route("collect/g/collect", "./pages/api/collect.ts"),
  ...prefix("webhooks", [route("stripe", "./pages/webhooks/stripe.ts")]),
  ...prefix("api", [
    route("cron", "./pages/api/cron.ts"),
    route("gtm", "./pages/api/gtm.ts"),
    route("latest-listings", "./pages/api/latest-listings.ts"),
    route("searchMap", "./pages/api/searchMap.ts"),
    route("login", "./pages/api/login.ts"),
    route("registration/account", "./pages/api/registration/account.ts"),
    route("registration/company", "./pages/api/registration/company.ts"),
    route("reset-fetcher", "./pages/api/reset-fetcher.ts"),

    route(
      "recovery-account-reset-2fa",
      "./pages/api/recovery/account-reset-2fa.ts",
    ),
    route("recovery-account", "./pages/api/recovery/account.ts"),
    route(
      "recovery-account-backup-email",
      "./pages/api/recovery/account-backup-email.ts",
    ),
    route(
      "recovery-account-change-password",
      "./pages/api/recovery/account-change-password.ts",
    ),

    ...prefix("account", [
      route("cookie", "./pages/api/account/cookie.ts"),
      route("session", "./pages/api/account/session.ts"),
      route("language", "./pages/api/account/language.ts"),
      route("report", "./pages/api/account/report.ts"),
      route(
        "authenticator/new-2fa",
        "./pages/api/account/authenticator/new-2fa.ts",
      ),
    ]),

    ...prefix("company", [
      route("banner", "./pages/api/company/banner.ts"),
      route(
        "subscriptions/delete",
        "./pages/api/company/subscriptions/delete.ts",
      ),
    ]),

    ...prefix("autocomplete", [
      route("city", "./pages/api/autocomplete/city.ts"),
      route("address", "./pages/api/autocomplete/address.ts"),
    ]),

    ...prefix("upload", [route("images", "./pages/api/upload/images.ts")]),
  ]),
  ...prefix("auth", [
    ...prefix("facebook", [
      index("./pages/auth/facebook/index.ts"),
      route("callback", "./pages/auth/facebook/callback.ts"),
    ]),
    ...prefix("google", [
      index("./pages/auth/google/index.ts"),
      route("callback", "./pages/auth/google/callback.ts"),
    ]),
  ]),
];

const createLocalizedRoutes = (langPrefix: string): RouteConfigEntry[] => {
  const id = (name: string) => (langPrefix ? `en-${name}` : name);

  return [
    index("./pages/home.tsx", { id: id("home") }),
    route("logowanie", "./pages/login.tsx", { id: id("login") }),
    route("o-nas", "./pages/about-us.tsx", { id: id("about-us") }),
    route("dostepnosc", "./pages/accessibility.tsx", {
      id: id("accessibility"),
    }),
    route("wyloguj", "./pages/logout.ts", { id: id("logout") }),
    route("flagi", "./pages/flags.tsx", { id: id("flags") }),
    route("pomoc", "./pages/help.tsx", { id: id("help") }),
    route("kontakt", "./pages/contact.tsx", { id: id("contact") }),
    route("jak-dodac-ogloszenie", "./pages/how-to-add-a-listing.tsx", {
      id: id("how-to-add-listing"),
    }),
    route("jak-szukac-ogloszenia", "./pages/how-to-search-a-listing.tsx", {
      id: id("how-to-search-listing"),
    }),
    route("uwierzytelniacz", "./pages/authenticator.ts", {
      id: id("authenticator"),
    }),
    route("blad", "./pages/error.tsx", { id: id("error") }),
    route("404", "./pages/404.tsx", { id: id("404") }),
    route("*", "./pages/404.tsx", { id: id("404-splat") }),
    route("blad-konto-nie-znalezione", "./pages/error-account-not-found.tsx", {
      id: id("error-account-not-found"),
    }),
    route("blad-logowanie-facebook", "./pages/error-login-from-facebook.tsx", {
      id: id("error-login-from-facebook"),
    }),
    route("blad-logowanie-google", "./pages/error-login-from-google.tsx", {
      id: id("error-login-from-google"),
    }),
    route("blad-logowanie-haslo", "./pages/error-login-from-password.tsx", {
      id: id("error-login-from-password"),
    }),
    route(
      "blad-ogloszenie-nie-znalezione",
      "./pages/error-listing-not-found.tsx",
      { id: id("error-listing-not-found") },
    ),
    route("handle-protocol", "./pages/handle-protocol.tsx", {
      id: id("handle-protocol"),
    }),
    route("newsletter", "./pages/newsletter.ts", { id: id("newsletter") }),
    route("polityka-prywatnosci", "./pages/privacy-policy.ts", {
      id: id("privacy-policy"),
    }),
    route("regulamin", "./pages/terms-and-conditions.ts", {
      id: id("terms-and-conditions"),
    }),
    ...prefix("miasta", [
      index("./pages/city/index.tsx", { id: id("cities") }),
      route(":listingCity", "./pages/city/listingCity.tsx", {
        id: id("cities-city"),
      }),
      route(
        ":listingCity/:listingCityDistrict",
        "./pages/city/listingCityDistrict.tsx",
        {
          id: id("cities-city-district"),
        },
      ),
    ]),
    ...prefix("szukaj", [
      index("./pages/search/index.tsx", { id: id("search") }),
      route(":listingCategory", "./pages/search/listingCategory.tsx", {
        id: id("search-category"),
      }),
      route(
        ":listingCategory/:listingCity",
        "./pages/search/listingCategoryCity.tsx",
        { id: id("search-category-city") },
      ),
      route(
        ":listingCategory/:listingCity/:listingCityDistrict",
        "./pages/search/listingCategoryCityDistrict.tsx",
        { id: id("search-category-city-district") },
      ),
    ]),
    ...prefix("ogloszenia", [
      route(":listingIdOrSlug", "./pages/listings/listing.tsx", {
        id: id("listing"),
      }),
    ]),
    route("odzyskaj-konto", "./pages/recovery/account.tsx", {
      id: id("recovery-account"),
    }),
    route(
      "odzyskaj-konto-email-zapasowy",
      "./pages/recovery/account-backup-email.tsx",
      { id: id("recovery-account-backup-email") },
    ),
    route(
      "odzyskaj-konto-zmien-haslo",
      "./pages/recovery/account-change-password.tsx",
      { id: id("recovery-account-change-password") },
    ),
    ...prefix("rejestracja", [
      index("./pages/registration/index.tsx", { id: id("registration") }),
      route("konto", "./pages/registration/account.tsx", {
        id: id("registration-account"),
      }),
      route("firma", "./pages/registration/company.tsx", {
        id: id("registration-company"),
      }),
    ]),
    ...prefix("blog", [
      index("./pages/blog/index.tsx", { id: id("blog") }),
      route(":blogPostSlug", "./pages/blog/blogPost.tsx", {
        id: id("blog-post"),
      }),
      route("rss.xml/*", "./pages/blog/rss.ts", { id: id("blog-rss") }),
    ]),
    layout("./pages/admin/layout.ts", { id: id("admin-layout") }, [
      ...prefix("admin", [
        index("./pages/admin/index.tsx", { id: id("admin") }),
        ...prefix("blog", [
          index("./pages/admin/blog/index.tsx", { id: id("admin-blog") }),
          route("nowy", "./pages/admin/blog/new.tsx", {
            id: id("admin-blog-new"),
          }),
          route(":blogPostId", "./pages/admin/blog/blogPost.tsx", {
            id: id("admin-blog-post"),
          }),
        ]),
        ...prefix("raporty", [
          index("./pages/admin/reports/index.tsx", { id: id("admin-reports") }),
        ]),
        ...prefix("bledy", [
          index("./pages/admin/bugs/index.tsx", { id: id("admin-bugs") }),
          route(":bugId", "./pages/admin/bugs/bug.tsx", {
            id: id("admin-bug"),
          }),
          ...prefix("edytuj", [
            route(":bugId", "./pages/admin/bugs/edit/bug.tsx", {
              id: id("admin-bug-edit"),
            }),
          ]),
        ]),
        ...prefix("kupony", [
          index("./pages/admin/coupons/index.tsx", { id: id("admin-coupons") }),
          route("nowy", "./pages/admin/coupons/new.tsx", {
            id: id("admin-coupon-new"),
          }),
          route(":couponId", "./pages/admin/coupons/coupon.tsx", {
            id: id("admin-coupon"),
          }),
        ]),
        ...prefix("wymiany", [
          index("./pages/admin/exchanges/index.tsx", {
            id: id("admin-exchanges"),
          }),
          route("nowa", "./pages/admin/exchanges/new.tsx", {
            id: id("admin-exchange-new"),
          }),
          route(":exchangeId", "./pages/admin/exchanges/exchange.tsx", {
            id: id("admin-exchange"),
          }),
        ]),
        ...prefix("plany", [
          index("./pages/admin/plans/index.tsx", { id: id("admin-plans") }),
          route("nowy", "./pages/admin/plans/new.tsx", {
            id: id("admin-plan-new"),
          }),
          route(":planId", "./pages/admin/plans/plan.tsx", {
            id: id("admin-plan"),
          }),
        ]),
        ...prefix("ustawienia", [
          index("./pages/admin/settings/index.tsx", {
            id: id("admin-settings"),
          }),
          route("nowe", "./pages/admin/settings/new.tsx", {
            id: id("admin-setting-new"),
          }),
          route("edytuj", "./pages/admin/settings/edit.tsx", {
            id: id("admin-setting-edit"),
          }),
        ]),
        ...prefix("produkty", [
          index("./pages/admin/products/index.tsx", {
            id: id("admin-products"),
          }),
          route("nowy", "./pages/admin/products/new.tsx", {
            id: id("admin-product-new"),
          }),
          route(":productId", "./pages/admin/products/product.tsx", {
            id: id("admin-product"),
          }),
        ]),
      ]),
    ]),
    ...prefix("konto", [
      index("./pages/account/index.tsx", { id: id("account") }),
      route("punkty", "./pages/account/points.tsx", {
        id: id("account-points"),
      }),
      route("faktury", "./pages/account/invoices.tsx", {
        id: id("account-invoices"),
      }),
      route("zgody", "./pages/account/consents.tsx", {
        id: id("account-consents"),
      }),
      route("polecenie", "./pages/account/referral.tsx", {
        id: id("account-referral"),
      }),
      route("sesje", "./pages/account/sessions.tsx", {
        id: id("account-sessions"),
      }),
      route("usun", "./pages/account/delete.tsx", { id: id("account-delete") }),
      route("email", "./pages/account/email.tsx", { id: id("account-email") }),
      route("haslo", "./pages/account/password.tsx", {
        id: id("account-password"),
      }),
      route("telefon", "./pages/account/phone.tsx", {
        id: id("account-phone"),
      }),
      route("profil", "./pages/account/profile.tsx", {
        id: id("account-profile"),
      }),
      ...prefix("uwierzytelniacz", [
        index("./pages/account/authenticator/index.tsx", {
          id: id("account-authenticator"),
        }),
      ]),
      ...prefix("bledy", [
        index("./pages/account/bugs/index.tsx", { id: id("account-bugs") }),
        route("nowy", "./pages/account/bugs/new.tsx", {
          id: id("account-bug-new"),
        }),
        route(":bugId", "./pages/account/bugs/bug.tsx", {
          id: id("account-bug"),
        }),
      ]),

      ...prefix("ogloszenia", [
        index("./pages/account/listings/index.tsx", {
          id: id("account-listings"),
        }),
        route("nowe", "./pages/account/listings/new.tsx", {
          id: id("account-listing-new"),
        }),
        route(":listingIdOrSlug", "./pages/account/listings/edit.tsx", {
          id: id("account-listing-edit"),
        }),
        route(
          ":listingIdOrSlug/platnosci",
          "./pages/account/listings/payments.tsx",
          {
            id: id("account-listing-payments"),
          },
        ),
      ]),
    ]),
    ...prefix("firma", [
      index("./pages/company/index.tsx", { id: id("company") }),
      route("ustawienia", "./pages/company/settings.tsx", {
        id: id("company-settings"),
      }),
      route("polecenie", "./pages/company/referral.tsx", {
        id: id("company-referral"),
      }),
      route("telefon", "./pages/company/phone.tsx", {
        id: id("company-phone"),
      }),
      route("karta", "./pages/company/card.tsx", { id: id("company-card") }),
      route("usun", "./pages/company/delete.tsx", { id: id("company-delete") }),
      ...prefix("profil", [
        index("./pages/company/profile/index.tsx", {
          id: id("company-profile"),
        }),
        route("edytuj", "./pages/company/profile/edit.tsx", {
          id: id("company-profile-edit"),
        }),
      ]),
      ...prefix("punkty", [
        index("./pages/company/points/index.tsx", { id: id("company-points") }),
        route("wymiany", "./pages/company/points/exchanges.tsx", {
          id: id("company-points-exchanges"),
        }),
      ]),
      ...prefix("bledy", [
        index("./pages/company/bugs/index.tsx", { id: id("company-bugs") }),
        route(":bugId", "./pages/company/bugs/bug.tsx", {
          id: id("company-bug"),
        }),
      ]),
      ...prefix("faktury", [
        index("./pages/company/invoices/index.tsx", {
          id: id("company-invoices"),
        }),
        route("edytuj", "./pages/company/invoices/edit.tsx", {
          id: id("company-invoice-edit"),
        }),
      ]),
      ...prefix("subskrypcje?", [
        index("./pages/company/subscriptions/index.tsx", {
          id: id("company-subscriptions"),
        }),
        route("nowa?", "./pages/company/subscriptions/new.tsx", {
          id: id("company-subscription-new"),
        }),
      ]),
      ...prefix("pracownicy", [
        route("nowy", "./pages/company/workers/new.tsx", {
          id: id("company-worker-new"),
        }),
        index("./pages/company/workers/index.tsx", {
          id: id("company-workers"),
        }),
        ...prefix(":workerId", [
          index("./pages/company/workers/worker/index.tsx", {
            id: id("company-worker"),
          }),
          route("profil", "./pages/company/workers/worker/profile.tsx", {
            id: id("company-worker-profile"),
          }),
          route(
            "uprawnienia",
            "./pages/company/workers/worker/permissions.tsx",
            { id: id("company-worker-permissions") },
          ),
          route("usun", "./pages/company/workers/worker/delete.tsx", {
            id: id("company-worker-delete"),
          }),
        ]),
      ]),

      ...prefix("ogloszenia", [
        index("./pages/company/listings/index.tsx", {
          id: id("company-listings"),
        }),
        route("nowe", "./pages/company/listings/new.tsx", {
          id: id("company-listing-new"),
        }),
        route(":listingIdOrSlug", "./pages/company/listings/edit.tsx", {
          id: id("company-listing-edit"),
        }),
        route(
          ":listingIdOrSlug/platnosci",
          "./pages/company/listings/payments.tsx",
          {
            id: id("company-listing-payments"),
          },
        ),
      ]),
    ]),
  ];
};

export default [
  ...nonLocalizedRoutes,
  ...createLocalizedRoutes(""),
  ...prefix("en", createLocalizedRoutes("en")),
] satisfies RouteConfig;
