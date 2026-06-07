/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  data as dataResponse,
  isRouteErrorResponse,
  redirect,
} from "react-router";

import type { T_GetRouteExtraQuery, T_RouteName } from "~/constants/routes";
import { E_Routes, getRoute } from "~/constants/routes";
import type localesModalsPL from "~/locales/pl/modals.json";
import type localesNotificationsPL from "~/locales/pl/notifications.json";
import {
  T_AutocompletePlace,
  Z_AutocompletePlace,
} from "~/models/autocompletePlace";
import {
  T_AutocompletePlaceSuggestions,
  Z_AutocompletePlaceSuggestions,
} from "~/models/autocompletePlaceSuggestions";
import { T_BlogPost, Z_BlogPost } from "~/models/blogPost";
import { T_BlogPosts, Z_BlogPosts } from "~/models/blogPosts";
import { type T_Bug, Z_Bug } from "~/models/bug";
import type { T_Bugs } from "~/models/bugs";
import { Z_Bugs } from "~/models/bugs";
import { T_Cities, Z_Cities } from "~/models/cities";
import { T_City, Z_City } from "~/models/city";
import {
  type T_CompanyInvoiceData,
  Z_CompanyInvoiceData,
} from "~/models/company/companyInvoiceData";
import {
  type T_CompanyProfile,
  Z_CompanyProfile,
} from "~/models/company/companyProfile";
import {
  type T_CompanyWorker,
  Z_CompanyWorker,
} from "~/models/company/companyWorker";
import type { T_CompanyWorkers } from "~/models/company/companyWorkers";
import { Z_CompanyWorkers } from "~/models/company/companyWorkers";
import type { T_Coupon } from "~/models/coupon";
import { Z_Coupon } from "~/models/coupon";
import type { T_Coupons } from "~/models/coupons";
import { Z_Coupons } from "~/models/coupons";
import type { T_Exchange } from "~/models/exchange";
import { Z_Exchange } from "~/models/exchange";
import type { T_Exchanges } from "~/models/exchanges";
import { Z_Exchanges } from "~/models/exchanges";
import { T_FlashData } from "~/models/flashData";
import { type T_Invoice, Z_Invoice } from "~/models/invoice";
import type { T_Invoices } from "~/models/invoices";
import { Z_Invoices } from "~/models/invoices";
import { T_Listing, Z_Listing } from "~/models/listing";
import { T_Listings, Z_Listings } from "~/models/listings";
import { T_ListingsMap, Z_ListingsMap } from "~/models/listingsMap";
import type { T_Plan } from "~/models/plan";
import { Z_Plan } from "~/models/plan";
import { type T_Plans, Z_Plans } from "~/models/plans";
import {
  type T_PlatformSetting,
  Z_PlatformSetting,
} from "~/models/platformSetting";
import { T_Product, Z_Product } from "~/models/product";
import { T_Products, Z_Products } from "~/models/products";
import { type T_Referral, Z_Referral } from "~/models/referral";
import { T_Report, Z_Report } from "~/models/report";
import { T_Reports, Z_Reports } from "~/models/reports";
import { type T_Subscription, Z_Subscription } from "~/models/subscription";
import type { T_Subscriptions } from "~/models/subscriptions";
import { Z_Subscriptions } from "~/models/subscriptions";
import { T_UserCookie, Z_UserCookie } from "~/models/userCookie";
import type { T_UserSession } from "~/models/userSession";
import { Z_UserSession } from "~/models/userSession";
import {
  type T_UserConsent,
  Z_UserConsent,
} from "~/models/userSession/userConsent";
import { serializeBigInt } from "~/utilities/converter";

import {
  destroyUserSession,
  generateUserCookiesSession,
  T_GenerateUserCookiesSession,
} from "./authSession.server";
import { omitNested } from "./date.server";
import { setFlashMessage } from "./flashMessage.server";
import {
  getLocalizedRedirectPath,
  hasUnexpectedKeys,
} from "./functions.server";
import {
  getActiveSubscription,
  getCompanyActivePlan,
  isFreeTrialActive,
} from "./subscription.server";
import type { T_ResultZodError } from "./zodValidator.server";

export type T_Messages = keyof typeof localesNotificationsPL;
export type T_Modals = keyof typeof localesModalsPL;

export const responseThrowError = ({
  error,
  request,
}: {
  error: unknown;
  request?: Request;
}) => {
  console.error(error);
  if (isRouteErrorResponse(error)) {
    throw error;
  }

  if (error instanceof Response && error.status >= 300 && error.status < 400) {
    throw error;
  }

  const errorPath = getRoute({
    route: E_Routes.error,
  });

  throw redirect(
    request ? getLocalizedRedirectPath(errorPath, request) : errorPath,
  );
};

export function throwNotFound(): never {
  throw new Response(null, {
    status: 404,
    statusText: "Not Found",
  });
}

export const responseGetOnFailure = async ({
  extraQuery,
  flashData,
  redirectPath = E_Routes.error,
  request,
}: {
  extraQuery?: T_GetRouteExtraQuery;
  flashData?: T_FlashData;
  redirectPath?: E_Routes;
  request: Request;
}) => {
  let finalHeaders: Headers | null = null;

  if (request && flashData) {
    finalHeaders = new Headers();
    const newFlashData: T_FlashData = {
      ...(flashData?.message ? { message: flashData.message } : {}),
      ...(flashData?.modal ? { modal: flashData.modal } : {}),
      ...(flashData?.refetchUserSession
        ? { refetchUserSession: flashData.refetchUserSession }
        : {}),
      ...(flashData?.logout ? { logout: flashData.logout } : {}),
      messageStatus: flashData?.messageStatus ?? "success",
    };

    const flashCookie = await setFlashMessage(request, newFlashData);
    finalHeaders.append("Set-Cookie", flashCookie);
  }

  const targetPath = getRoute({
    extraQuery,
    route: redirectPath,
  });

  return redirect(
    getLocalizedRedirectPath(targetPath, request),
    finalHeaders
      ? {
          headers: finalHeaders,
        }
      : {},
  );
};

export const responseGetOnFailureLogout = async ({
  message = "sessionExpired",
  redirectPath = E_Routes.login,
  request,
}: {
  message?: string;
  redirectPath?: E_Routes;
  request: Request;
}) => {
  return await destroyUserSession({
    forceStatusError: true,
    message,
    request,
    route: redirectPath,
    status: 401,
    withLogout: true,
    withRedirect: true,
  });
};

export type T_ResponseOnFailure = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  formErrors?: T_ResultZodError[];
  headers?: HeadersInit;
  message?: null | T_Messages;
  modal?: null | T_Modals;
  request: Request;
  status?: number;
};

export const responseOnFailure = async ({
  formErrors,
  headers,
  message = "somethingWentWrong",
  request,
  status = 404,
  ...restProps
}: T_ResponseOnFailure) => {
  let finalHeaders: Headers | null = null;
  if (headers) {
    finalHeaders = new Headers(headers);
  }

  if (message) {
    if (!finalHeaders) {
      finalHeaders = new Headers();
    }

    const newFlashData: T_FlashData = {
      message,
      messageStatus: "error",
    };

    const flashCookie = await setFlashMessage(request, newFlashData);
    finalHeaders.append("Set-Cookie", flashCookie);
  }

  return dataResponse(
    {
      formErrors,
      message,
      ...restProps,
      status,
    },
    status === 401
      ? {
          headers,
          status,
        }
      : {
          headers,
        },
  );
};

export const responseOnFailureServer = async ({
  error,
  request,
}: {
  error: unknown;
  request: Request;
}) => {
  console.error(error);
  return await responseOnFailure({
    message: "somethingWentWrong",
    request,
    status: 500,
  });
};

type T_DataRedirectTo = {
  customUrl?: string;
  extraPath?: string;
  extraQuery?: T_GetRouteExtraQuery;
  route: null | T_RouteName;
};

export type T_Data = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  autocompletePlace?: null | T_AutocompletePlace;
  autocompletePlaceSuggestions?: T_AutocompletePlaceSuggestions;
  blogPost?: T_BlogPost;
  blogPosts?: T_BlogPosts;
  bug?: T_Bug;
  bugs?: T_Bugs;
  cities?: T_Cities;
  city?: null | T_City;
  code?: string;
  companyInvoiceData?: null | T_CompanyInvoiceData;
  companyProfile?: T_CompanyProfile;
  companyWorker?: T_CompanyWorker;
  companyWorkers?: T_CompanyWorkers;
  coupon?: null | T_Coupon;
  coupons?: T_Coupons;
  exchange?: null | T_Exchange;
  exchanges?: T_Exchanges;
  invoice?: null | T_Invoice;
  invoices?: T_Invoices;
  listing?: T_Listing;
  listings?: T_Listings;
  listingsMap?: T_ListingsMap;
  listingsMapCount?: null | number;
  message?: T_Messages;
  modal?: T_Modals;
  nextPage?: null | number;
  plan?: null | T_Plan;
  plans?: T_Plans;
  platformSetting?: null | T_PlatformSetting;
  product?: null | T_Product;
  products?: T_Products;
  referral?: null | T_Referral;
  refetchUserSession?: boolean;
  report?: T_Report;
  reports?: T_Reports;
  request?: undefined; // NOSONAR
  subscription?: null | T_Subscription;
  subscriptions?: T_Subscriptions;
  totalPages?: null | number;
  totalResults?: null | number;
  userConsent?: T_UserConsent;
  userCookie?: T_UserCookie;
  userSession?: T_UserSession;
  userSessionCompanyListingsInCurrentMonth?: number;
};

type T_ResponseOnSuccess = {
  cacheResponse?:
    | {
        maxAge?: number;
      }
    | boolean;
  data?: T_Data;

  extraHeaders?: HeadersInit;
  flashData?: T_FlashData;
  newUserSession?: T_GenerateUserCookiesSession;
  redirectTo?: T_DataRedirectTo | T_RouteName;
  request: Request;
  status?: number;
};

export const responseOnSuccess = async ({
  cacheResponse,
  data = {},
  extraHeaders = {},
  flashData,
  newUserSession,
  redirectTo,
  request,
  status = 200,
}: T_ResponseOnSuccess) => {
  try {
    const dataProps: T_Data = data;

    if (data?.request) {
      console.error("Request in response!!!");
    }

    if (data?.userSession) {
      const countWorkers =
        // @ts-ignore
        data?.userSession?.company?._count?.workers ?? null;
      const userSessionValidFields: T_UserSession = Z_UserSession.parse(
        data?.userSession,
      );
      const returnType = Z_UserSession.safeParse(userSessionValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.userSession = serializeBigInt(userSessionValidFields);
      if (dataProps?.userSession?.company) {
        if (
          typeof data?.userSessionCompanyListingsInCurrentMonth === "number"
        ) {
          dataProps.userSession.company.createdListingsInCurrentMonth =
            data.userSessionCompanyListingsInCurrentMonth;
        }

        if (dataProps?.userSession?.company?.stripe) {
          // @ts-ignore
          dataProps.userSession.company.stripe.customerHasCard =
            // @ts-ignore
            !!dataProps.userSession.company.stripe.customerCardId;
          // @ts-ignore
          dataProps.userSession.company.stripe.customerCardId = undefined;

          // @ts-ignore
          dataProps.userSession.company.stripe.customerActive =
            // @ts-ignore
            !!dataProps.userSession.company.stripe.customerId;
          // @ts-ignore
          dataProps.userSession.company.stripe.customerId = undefined;

          dataProps.userSession.company.stripe = omitNested(
            dataProps.userSession.company.stripe,
            {
              customerCardId: false,
              customerId: false,
            },
          );
        }

        if (dataProps?.userSession?.company?.subscriptions) {
          const validFreeTrial = dataProps?.userSession?.company?.freeTrial
            ? {
                endDate: dataProps.userSession.company.freeTrial.endDate,
                id: dataProps.userSession.company.freeTrial.id,
                plan: dataProps.userSession.company.freeTrial.plan,
                startDate: dataProps.userSession.company.freeTrial.startDate,
              }
            : null;

          const foundActivePlan = getCompanyActivePlan({
            freeTrial: validFreeTrial,
            subscriptions: dataProps.userSession.company.subscriptions,
          });

          const checkIsActiveFreeTrial = validFreeTrial
            ? isFreeTrialActive({
                freeTrial: validFreeTrial,
              })
            : false;

          const foundActiveSubscription = getActiveSubscription({
            subscriptions: dataProps.userSession.company.subscriptions,
          });

          dataProps.userSession.company.activePlanInSubscriptionOrFreeTrial =
            foundActivePlan;
          dataProps.userSession.company.isActiveFreeTrial =
            checkIsActiveFreeTrial;

          dataProps.userSession.company.isActiveSubscription =
            !!foundActiveSubscription;

          dataProps.userSession.company.countWorkers = countWorkers;

          if (
            typeof data?.userSessionCompanyListingsInCurrentMonth ===
              "number" &&
            foundActivePlan
          ) {
            dataProps.userSession.company.isAvailableSlotsToCreateNewListing =
              data.userSessionCompanyListingsInCurrentMonth <
              foundActivePlan.maximumListingsInMonth;

            dataProps.userSession.company.availableSlotToCreateNewListing =
              foundActivePlan.maximumListingsInMonth -
              data.userSessionCompanyListingsInCurrentMonth;
          }
        }
      }
    }

    if (data?.userCookie) {
      const userCookieValidFields: T_UserCookie = Z_UserCookie.parse(
        data?.userCookie,
      );
      const returnType = Z_UserCookie.safeParse(userCookieValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }

      dataProps.userCookie = serializeBigInt(userCookieValidFields);
    }

    if (data?.companyWorker) {
      const workerValidFields: T_CompanyWorker = Z_CompanyWorker.parse(
        data?.companyWorker,
      );
      const returnType = Z_CompanyWorker.safeParse(workerValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }

      dataProps.companyWorker = serializeBigInt(workerValidFields);
    }

    if (data?.companyWorkers) {
      const workersValidFields: T_CompanyWorkers = Z_CompanyWorkers.parse(
        data?.companyWorkers,
      );
      const returnType = Z_CompanyWorkers.safeParse(workersValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }

      dataProps.companyWorkers = serializeBigInt(workersValidFields);
    }

    if (data?.referral) {
      const referralValidFields: T_Referral = Z_Referral.parse(data?.referral);
      const returnType = Z_Referral.safeParse(referralValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }

      dataProps.referral = serializeBigInt(referralValidFields);
    }

    if (data?.companyProfile) {
      const companyProfileValidFields: T_CompanyProfile =
        Z_CompanyProfile.parse(data?.companyProfile);
      const returnType = Z_CompanyProfile.safeParse(companyProfileValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }

      dataProps.companyProfile = serializeBigInt(companyProfileValidFields);
    }

    if (data?.coupons) {
      const couponsValidFields: T_Coupons = Z_Coupons.parse(data?.coupons);
      const returnType = Z_Coupons.safeParse(couponsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.coupons = serializeBigInt(couponsValidFields);
    }

    if (data?.coupon) {
      const couponValidFields: T_Coupon = Z_Coupon.parse(data?.coupon);
      const returnType = Z_Coupon.safeParse(couponValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.coupon = serializeBigInt(couponValidFields);
    }

    if (data?.autocompletePlaceSuggestions) {
      const autocompletePlaceSuggestionsValidFields: T_AutocompletePlaceSuggestions =
        Z_AutocompletePlaceSuggestions.parse(
          data?.autocompletePlaceSuggestions,
        );
      const returnType = Z_AutocompletePlaceSuggestions.safeParse(
        autocompletePlaceSuggestionsValidFields,
      );
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.autocompletePlaceSuggestions = serializeBigInt(
        autocompletePlaceSuggestionsValidFields,
      );
    }

    if (data?.autocompletePlace) {
      const placeValidFields: null | T_AutocompletePlace =
        Z_AutocompletePlace.nullable().parse(data?.autocompletePlace);
      const returnType =
        Z_AutocompletePlace.nullable().safeParse(placeValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.autocompletePlace = serializeBigInt(placeValidFields);
    }

    if (data?.plans) {
      const plansValidFields: T_Plans = Z_Plans.parse(data?.plans);
      const returnType = Z_Plans.safeParse(plansValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.plans = serializeBigInt(plansValidFields);
    }

    if (data?.plan) {
      const planValidFields: null | T_Plan = Z_Plan.nullable().parse(
        data?.plan,
      );
      const returnType = Z_Plan.nullable().safeParse(planValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.plan = serializeBigInt(planValidFields);
    }

    if (data?.products) {
      const productsValidFields: T_Products = Z_Products.parse(data?.products);
      const returnType = Z_Products.safeParse(productsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.products = serializeBigInt(productsValidFields);
    }

    if (data?.product) {
      const productValidFields: null | T_Product = Z_Product.nullable().parse(
        data?.product,
      );
      const returnType = Z_Product.nullable().safeParse(productValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.product = serializeBigInt(productValidFields);
    }

    if (data?.exchanges) {
      const exchangesValidFields: T_Exchanges = Z_Exchanges.parse(
        data?.exchanges,
      );
      const returnType = Z_Exchanges.safeParse(exchangesValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.exchanges = serializeBigInt(exchangesValidFields);
    }

    if (data?.exchange) {
      const exchangeValidFields: null | T_Exchange =
        Z_Exchange.nullable().parse(data?.exchange);
      const returnType = Z_Exchange.nullable().safeParse(exchangeValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.exchange = serializeBigInt(exchangeValidFields);
    }

    if (data?.companyInvoiceData) {
      const companyInvoiceDataValidFields: null | T_CompanyInvoiceData =
        Z_CompanyInvoiceData.nullable().parse(data?.companyInvoiceData);
      const returnType = Z_CompanyInvoiceData.nullable().safeParse(
        companyInvoiceDataValidFields,
      );
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.companyInvoiceData = serializeBigInt(
        companyInvoiceDataValidFields,
      );
    }

    if (data?.userConsent) {
      const userConsentValidFields: T_UserConsent = Z_UserConsent.parse(
        data?.userConsent,
      );
      const returnType = Z_UserConsent.safeParse(userConsentValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.userConsent = serializeBigInt(userConsentValidFields);
    }

    if (data?.subscriptions) {
      const subscriptionsValidFields: T_Subscriptions = Z_Subscriptions.parse(
        data?.subscriptions,
      );
      const returnType = Z_Subscriptions.safeParse(subscriptionsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.subscriptions = serializeBigInt(subscriptionsValidFields);
    }

    if (data?.subscription) {
      const subscriptionValidFields: T_Subscription = Z_Subscription.parse(
        data?.subscription,
      );
      const returnType = Z_Subscription.safeParse(subscriptionValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.subscription = serializeBigInt(subscriptionValidFields);
    }

    if (data?.platformSetting) {
      const platformSettingValidFields: T_PlatformSetting =
        Z_PlatformSetting.parse(data?.platformSetting);
      const returnType = Z_PlatformSetting.safeParse(
        platformSettingValidFields,
      );
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.platformSetting = serializeBigInt(platformSettingValidFields);
    }

    if (data?.invoices) {
      const invoicesValidFields: T_Invoices = Z_Invoices.parse(data?.invoices);
      const returnType = Z_Invoices.safeParse(invoicesValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.invoices = serializeBigInt(invoicesValidFields);
    }

    if (data?.invoice) {
      const invoiceValidFields: T_Invoice = Z_Invoice.parse(data?.invoice);
      const returnType = Z_Invoice.safeParse(invoiceValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.invoice = serializeBigInt(invoiceValidFields);
    }

    if (data?.listings) {
      const returnType = Z_Listings.safeParse(data?.listings);
      if (!returnType.success) {
        console.error("Listings validation error:", returnType.error.message);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.listings = serializeBigInt(returnType.data);
    }

    if (data?.listingsMap) {
      const listingsValidFields: T_ListingsMap = Z_ListingsMap.parse(
        data?.listingsMap,
      );
      const returnType = Z_ListingsMap.safeParse(listingsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.listingsMap = serializeBigInt(listingsValidFields);
    }

    if (data?.listing) {
      const listingValidFields: T_Listing = Z_Listing.parse(data?.listing);
      const returnType = Z_Listing.safeParse(listingValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.listing = serializeBigInt(listingValidFields);
    }

    if (data?.cities) {
      const citiesValidFields: T_Cities = Z_Cities.parse(data?.cities);
      const returnType = Z_Cities.safeParse(citiesValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.cities = serializeBigInt(citiesValidFields);
    }

    if (data?.city) {
      const cityValidFields: T_City = Z_City.parse(data?.city);
      const returnType = Z_City.safeParse(cityValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.city = serializeBigInt(cityValidFields);
    }

    if (data?.bugs) {
      const bugsValidFields: T_Bugs = Z_Bugs.parse(data?.bugs);
      const returnType = Z_Bugs.safeParse(bugsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.bugs = serializeBigInt(bugsValidFields);
    }

    if (data?.bug) {
      const bugValidFields: T_Bug = Z_Bug.parse(data?.bug);
      const returnType = Z_Bug.safeParse(bugValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.bug = serializeBigInt(bugValidFields);
    }

    if (data?.reports) {
      const reportsValidFields: T_Reports = Z_Reports.parse(data?.reports);
      const returnType = Z_Reports.safeParse(reportsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.reports = serializeBigInt(reportsValidFields);
    }

    if (data?.report) {
      const reportValidFields: T_Report = Z_Report.parse(data?.report);
      const returnType = Z_Report.safeParse(reportValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.report = serializeBigInt(reportValidFields);
    }

    if (data?.blogPosts) {
      const blogPostsValidFields: T_BlogPosts = Z_BlogPosts.parse(
        data?.blogPosts,
      );
      const returnType = Z_BlogPosts.safeParse(blogPostsValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.blogPosts = serializeBigInt(blogPostsValidFields);
    }

    if (data?.blogPost) {
      const blogPostValidFields: T_BlogPost = Z_BlogPost.parse(data?.blogPost);
      const returnType = Z_BlogPost.safeParse(blogPostValidFields);
      if (!returnType.success) {
        console.error(returnType.error);
        return await responseOnFailure({ message: "badData", request });
      }
      dataProps.blogPost = serializeBigInt(blogPostValidFields);
    }

    const finalHeaders = new Headers(extraHeaders);

    if (cacheResponse) {
      const maxAge =
        typeof cacheResponse === "boolean" ? 60 : (cacheResponse?.maxAge ?? 60);
      finalHeaders.set("Cache-Control", `public, max-age=${maxAge}`);
    }

    if (newUserSession) {
      finalHeaders.append(
        "Set-Cookie",
        await generateUserCookiesSession(newUserSession),
      );
    }

    if (redirectTo) {
      const isOtherDataInResult = hasUnexpectedKeys({
        allowedKeys: {
          message: true,
          modal: true,
          refetchUserSession: true,
        },
        object: dataProps,
      });

      if (isOtherDataInResult) {
        console.error("Detected extra data in redirect", isOtherDataInResult);
      }
    }

    // Set flash message cookie if request is available
    if (request && flashData) {
      const newFlashData: T_FlashData = {
        ...(flashData?.message ? { message: flashData.message } : {}),
        ...(flashData?.modal ? { modal: flashData.modal } : {}),
        ...(flashData?.refetchUserSession
          ? { refetchUserSession: flashData.refetchUserSession }
          : {}),
        ...(flashData?.logout ? { logout: flashData.logout } : {}),
        messageStatus: flashData?.messageStatus ?? "success",
      };

      const flashCookie = await setFlashMessage(request, newFlashData);
      finalHeaders.append("Set-Cookie", flashCookie);
    }

    if (redirectTo && typeof redirectTo !== "string" && redirectTo.customUrl) {
      return redirect(getLocalizedRedirectPath(redirectTo.customUrl, request), {
        headers: finalHeaders,
      });
    }

    if (typeof redirectTo === "string") {
      const targetPath = getRoute({
        route: redirectTo,
      });
      return redirect(getLocalizedRedirectPath(targetPath, request), {
        headers: finalHeaders,
      });
    } else if (redirectTo?.route) {
      const targetPath = getRoute({
        extraPath: redirectTo.extraPath,
        extraQuery: redirectTo?.extraQuery,
        route: redirectTo.route,
      });
      return redirect(getLocalizedRedirectPath(targetPath, request), {
        headers: finalHeaders,
      });
    }

    return dataResponse(dataProps, {
      headers: finalHeaders,
      status: status,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    throw responseOnFailure({
      message: "badData",
      request,
      status: 401,
    });
  }
};
