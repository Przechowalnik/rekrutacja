export enum E_Routes {
  aboutUs = "aboutUs",
  accessibility = "accessibility",
  account = "account",
  accountAuthenticator = "accountAuthenticator",
  accountBugDetails = "accountBugDetails",
  accountBugNew = "accountBugNew",
  accountBugs = "accountBugs",
  accountConsents = "accountConsents",
  accountDelete = "accountDelete",
  accountEmail = "accountEmail",
  accountListings = "accountListings",
  accountListingsEdit = "accountListingsEdit",
  accountListingsNew = "accountListingsNew",
  accountListingsPayments = "accountListingsPayments",
  accountPassword = "accountPassword",
  accountPhone = "accountPhone",
  accountProfile = "accountProfile",
  accountSessions = "accountSessions",
  admin = "admin",
  adminBugDetails = "adminBugDetails",
  adminBugEdit = "adminBugEdit",
  adminBugs = "adminBugs",
  adminMarketingEmail = "adminMarketingEmail",
  adminReports = "adminReports",
  apiAccountAuthenticatorNew2FA = "apiAccountAuthenticatorNew2FA",
  apiAccountCookie = "apiAccountCookie",
  apiAccountLanguage = "apiAccountLanguage",
  apiAccountReport = "apiAccountReport",
  apiAccountSession = "apiAccountSession",
  apiAutocompleteAddress = "apiAutocompleteAddress",
  apiAutocompleteCity = "apiAutocompleteCity",
  apiCompanyBanner = "apiCompanyBanner",
  apiLatestListings = "apiLatestListings",
  apiLogin = "apiLogin",
  apiRecoveryAccount = "apiRecoveryAccount",
  apiRecoveryAccountBackupEmail = "apiRecoveryAccountBackupEmail",
  apiRecoveryAccountChangePassword = "apiRecoveryAccountChangePassword",
  apiRecoveryAccountReset2FA = "apiRecoveryAccountReset2FA",
  apiRegistrationAccount = "apiRegistrationAccount",
  apiRegistrationCompany = "apiRegistrationCompany",
  apiResetFetcher = "apiResetFetcher",
  apiSearch = "apiSearch",
  apiSearchMap = "apiSearchMap",
  archive = "archive",
  authenticator = "authenticator",
  cities = "cities",
  company = "company",
  companyBugDetails = "companyBugDetails",
  companyBugs = "companyBugs",
  companyDelete = "companyDelete",
  companyListings = "companyListings",
  companyListingsEdit = "companyListingsEdit",
  companyListingsNew = "companyListingsNew",
  companyListingsPayments = "companyListingsPayments",
  companyPhone = "companyPhone",
  companyProfile = "companyProfile",
  companyProfileEdit = "companyProfileEdit",
  companySettings = "companySettings",
  companyWorkerEdit = "companyWorkerEdit",
  companyWorkerNew = "companyWorkerNew",
  companyWorkers = "companyWorkers",
  contact = "contact",
  error = "error",
  errorAccountNotFound = "errorAccountNotFound",
  errorListingNotFound = "errorListingNotFound",
  errorLoginFromFacebook = "errorLoginFromFacebook",
  errorLoginFromGoogle = "errorLoginFromGoogle",
  errorLoginFromPassword = "errorLoginFromPassword",
  help = "help",
  home = "home",
  howToAddListing = "howToAddListing",
  howToSearchListing = "howToSearchListing",
  listings = "listings",
  login = "login",
  loginFacebook = "loginFacebook",
  loginFromCreateListing = "loginFromCreateListing",
  loginGoogle = "loginGoogle",
  logout = "logout",
  newsletter = "newsletter",
  pricing = "pricing",
  privacyPolicy = "privacyPolicy",
  recoveryAccount = "recoveryAccount",
  recoveryAccountBackupEmail = "recoveryAccountBackupEmail",
  recoveryAccountChangePassword = "recoveryAccountChangePassword",
  registration = "registration",
  registrationAccount = "registrationAccount",
  registrationCompany = "registrationCompany",
  search = "search",
  termsAndConditions = "termsAndConditions",
}

export const routes = {
  [E_Routes.aboutUs]: "/o-nas",
  [E_Routes.accessibility]: "/dostepnosc",
  [E_Routes.account]: "/konto",
  [E_Routes.accountAuthenticator]: "/konto/uwierzytelniacz",
  [E_Routes.accountBugDetails]: "/konto/bledy",
  [E_Routes.accountBugNew]: "/konto/bledy/nowy",
  [E_Routes.accountBugs]: "/konto/bledy",
  [E_Routes.accountConsents]: "/konto/zgody",
  [E_Routes.accountDelete]: "/konto/usun",
  [E_Routes.accountEmail]: "/konto/email",
  [E_Routes.accountListings]: "/konto/ogloszenia",
  [E_Routes.accountListingsEdit]: "/konto/ogloszenia",
  [E_Routes.accountListingsNew]: "/konto/ogloszenia/nowe",
  [E_Routes.accountListingsPayments]: "/konto/ogloszenia",
  [E_Routes.accountPassword]: "/konto/haslo",
  [E_Routes.accountPhone]: "/konto/telefon",
  [E_Routes.accountProfile]: "/konto/profil",
  [E_Routes.accountSessions]: "/konto/sesje",
  [E_Routes.admin]: "/admin",
  [E_Routes.adminBugDetails]: "/admin/bledy",
  [E_Routes.adminBugEdit]: "/admin/bledy/edytuj",
  [E_Routes.adminBugs]: "/admin/bledy",
  [E_Routes.adminMarketingEmail]: "/admin/marketing-email",
  [E_Routes.adminReports]: "/admin/raporty",
  [E_Routes.apiAccountAuthenticatorNew2FA]:
    "/api/account/authenticator/new-2fa",
  [E_Routes.apiAccountCookie]: "/api/account/cookie",
  [E_Routes.apiAccountLanguage]: "/api/account/language",
  [E_Routes.apiAccountReport]: "/api/account/report",
  [E_Routes.apiAccountSession]: "/api/account/session",
  [E_Routes.apiAutocompleteAddress]: "/api/autocomplete/address",
  [E_Routes.apiAutocompleteCity]: "/api/autocomplete/city",
  [E_Routes.apiCompanyBanner]: "/api/company/banner",
  [E_Routes.apiLatestListings]: "/api/latest-listings",
  [E_Routes.apiLogin]: "/api/login",
  [E_Routes.apiRecoveryAccount]: "/api/recovery-account",
  [E_Routes.apiRecoveryAccountBackupEmail]:
    "/api/recovery-account-backup-email",
  [E_Routes.apiRecoveryAccountChangePassword]:
    "/api/recovery-account-change-password",
  [E_Routes.apiRecoveryAccountReset2FA]: "/api/recovery-account-reset-2fa",
  [E_Routes.apiRegistrationAccount]: "/api/registration/account",
  [E_Routes.apiRegistrationCompany]: "/api/registration/company",
  [E_Routes.apiResetFetcher]: "/api/reset-fetcher",
  [E_Routes.apiSearch]: "/api/search",
  [E_Routes.apiSearchMap]: "/api/searchMap",
  [E_Routes.archive]: "/archiwum",
  [E_Routes.authenticator]: "/uwierzytelniacz",
  [E_Routes.cities]: "/miasta",
  [E_Routes.company]: "/firma",
  [E_Routes.companyBugDetails]: "/firma/bledy",
  [E_Routes.companyBugs]: "/firma/bledy",
  [E_Routes.companyDelete]: "/firma/usun",
  [E_Routes.companyListings]: "/firma/ogloszenia",
  [E_Routes.companyListingsEdit]: "/firma/ogloszenia",
  [E_Routes.companyListingsNew]: "/firma/ogloszenia/nowe",
  [E_Routes.companyListingsPayments]: "/firma/ogloszenia",
  [E_Routes.companyPhone]: "/firma/telefon",
  [E_Routes.companyProfile]: "/firma/profil",
  [E_Routes.companyProfileEdit]: "/firma/profil/edytuj",
  [E_Routes.companySettings]: "/firma/ustawienia",
  [E_Routes.companyWorkerEdit]: "/firma/pracownicy",
  [E_Routes.companyWorkerNew]: "/firma/pracownicy/nowy",
  [E_Routes.companyWorkers]: "/firma/pracownicy",
  [E_Routes.contact]: "/kontakt",
  [E_Routes.error]: "/blad",
  [E_Routes.errorAccountNotFound]: "/blad-konto-nie-znalezione",
  [E_Routes.errorListingNotFound]: "/blad-ogloszenie-nie-znalezione",
  [E_Routes.errorLoginFromFacebook]: "/blad-logowanie-facebook",
  [E_Routes.errorLoginFromGoogle]: "/blad-logowanie-google",
  [E_Routes.errorLoginFromPassword]: "/blad-logowanie-haslo",
  [E_Routes.help]: "/pomoc",
  [E_Routes.home]: "/",
  [E_Routes.howToAddListing]: "/jak-dodac-ogloszenie",
  [E_Routes.howToSearchListing]: "/jak-szukac-ogloszenia",
  [E_Routes.listings]: "/ogloszenia",
  [E_Routes.login]: "/logowanie",
  [E_Routes.loginFacebook]: "/auth/facebook",
  [E_Routes.loginFromCreateListing]: "/logowanie?alert=showLoginListing",
  [E_Routes.loginGoogle]: "/auth/google",
  [E_Routes.logout]: "/wyloguj",
  [E_Routes.newsletter]: "/newsletter",
  [E_Routes.pricing]: "/pricing",
  [E_Routes.privacyPolicy]: "/polityka-prywatnosci",
  [E_Routes.recoveryAccount]: "/odzyskaj-konto",
  [E_Routes.recoveryAccountBackupEmail]: "/odzyskaj-konto-email-zapasowy",
  [E_Routes.recoveryAccountChangePassword]: "/odzyskaj-konto-zmien-haslo",
  [E_Routes.registration]: "/rejestracja",
  [E_Routes.registrationAccount]: "/rejestracja/konto",
  [E_Routes.registrationCompany]: "/rejestracja/firma",
  [E_Routes.search]: "/szukaj",
  [E_Routes.termsAndConditions]: "/regulamin",
} as const;

export const routesExtra = {
  [E_Routes.accountListings]: {
    payments: "/platnosci",
  },
  [E_Routes.companyListings]: {
    payments: "/platnosci",
  },
  [E_Routes.companyWorkerEdit]: {
    delete: "/usun",
    permissions: "/uprawnienia",
    profile: "/profil",
  },
};

type T_GenericRoutes<T extends Record<E_Routes, string>> = {
  [K in keyof T]: string;
};

type T_Routes = T_GenericRoutes<typeof E_Routes>;

export type T_RouteName = keyof T_Routes;
export type T_RouteValue = (typeof routes)[keyof typeof routes];

export type T_GetRouteExtraQuery = {
  [key: string]: string | string[];
};

export type T_GetRoute = {
  extraPath?: string;
  extraQuery?: T_GetRouteExtraQuery;
  route: E_Routes | T_RouteName;
};

export const getRoute = ({
  extraPath = "",
  extraQuery,
  route,
}: T_GetRoute): T_RouteValue => {
  const baseRoute = routes?.[route] ?? routes[E_Routes.error];
  const queryParameters: string[] = [];

  if (extraQuery) {
    for (const [key, value] of Object.entries(extraQuery)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          queryParameters.push(`${key}=${encodeURIComponent(v)}`);
        }
      } else {
        queryParameters.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
  }

  const queryString =
    queryParameters.length > 0 ? `?${queryParameters.join("&")}` : "";

  return `${baseRoute}${extraPath}${queryString}` as T_RouteValue;
};
