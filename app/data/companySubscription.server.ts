import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import {
  addToCompanyStripeCustomerAndUpdateCardIfExist,
  responseCatchErrorWithStripeCard,
} from "./companyStripe.server";
import { hasDateExpired } from "./date.server";
import {
  sendSubscriptionCancelled,
  sendSubscriptionCreated,
} from "./emailsGenerator.server";
import { isFreeListingsServer } from "./flags.server";
import {
  E_PlanTypeServer,
  E_RolesServer,
  E_SubscriptionStatusServer,
} from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectCoupon,
  prismaSelectSubscription,
} from "./prismaSelect.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { stripe } from "./stripe.server";
import { getActiveSubscription } from "./subscription.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const createNewSubscription = async ({
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      arrayData: [formNames.plansId],
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.couponPromotionCode]:
          zodValidator.couponPromotionCode.optional(),
        [formNames.paymentMethodId]: zodValidator.paymentMethodId.optional(),
        [formNames.planId]: zodValidator.planId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data || !userCompanyId || isFreeListingsServer()) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              freeTrial: {
                select: {
                  id: true,
                },
              },
              invoiceData: {
                select: {
                  taxCountry: true,
                  taxNumber: true,
                },
              },
              name: true,
              phone: {
                select: {
                  countryCode: true,
                  number: true,
                },
              },
              stripe: {
                select: {
                  accountId: true,
                  customerCardId: true,
                  customerId: true,
                },
              },
            },
          },
          email: true,
          lang: true,
          role: true,
        },
        where: {
          companyId: userCompanyId,
          id: userId,
          role: E_RolesServer.B2B_OWNER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.company?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      !existingUser?.company?.invoiceData?.taxCountry ||
      !existingUser?.company?.invoiceData?.taxNumber
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const { couponPromotionCode, paymentMethodId, planId } =
      resultValidator.data;

    if (!existingUser?.company?.stripe?.customerCardId && !paymentMethodId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const foundActiveSubscriptions = await database.subscription.count({
      where: {
        companyId: existingUser.company.id,
        status: {
          notIn: [E_SubscriptionStatusServer.CANCELLED],
        },
      },
    });

    if (foundActiveSubscriptions > 0) {
      return await responseOnFailure({
        message: "companyHasActiveSubscription",
        request,
        status: 422,
      });
    }

    const foundPlan = await database.plan.findUnique({
      select: {
        id: true,
        name: true,
        stripePlanId: true,
        stripeProductId: true,
      },
      where: {
        id: planId,
        isDeletedAt: null,
        NOT: {
          type: E_PlanTypeServer.TRIAL,
        },
      },
    });

    if (!foundPlan?.stripePlanId) {
      return await responseOnFailure({
        message: "notFoundPlan",
        request,
        status: 422,
      });
    }

    const foundCoupon = couponPromotionCode
      ? await database.coupon.findUnique({
          select: {
            id: true,
            stripeCouponId: true,
          },
          where: {
            NOT: {
              enabledAt: null,
            },
            plans: {
              some: {
                id: foundPlan.id,
              },
            },
            promotionCode: couponPromotionCode.toUpperCase(),
          },
        })
      : null;

    if (couponPromotionCode && !foundCoupon?.id) {
      return await responseOnFailure({
        message: "notFoundCoupon",
        request,
        status: 422,
      });
    }

    const resultAddToCompanyStripeCustomer =
      await addToCompanyStripeCustomerAndUpdateCardIfExist({
        paymentMethodId,
        request,
        user: existingUser,
      });

    if (resultAddToCompanyStripeCustomer?.responseError) {
      return await responseOnFailure(
        resultAddToCompanyStripeCustomer.responseError,
      );
    }

    const { stripeCustomerId } = resultAddToCompanyStripeCustomer;

    if (!stripeCustomerId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const foundActiveSubscriptionsBeforeCreate =
      await database.subscription.count({
        where: {
          companyId: existingUser.company.id,
          status: {
            notIn: [E_SubscriptionStatusServer.CANCELLED],
          },
        },
      });

    if (foundActiveSubscriptionsBeforeCreate > 0) {
      return await responseOnFailure({
        message: "companyHasActiveSubscription",
        request,
        status: 422,
      });
    }

    const companyAllSubscriptions = await database.subscription.count({
      where: {
        companyId: existingUser.company.id,
      },
    });

    const stripeCompanySubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      description: foundPlan.name,
      expand: ["latest_invoice.payment_intent"],
      items: [
        {
          discounts: [
            {
              coupon: foundCoupon?.stripeCouponId,
            },
          ],
          plan: foundPlan.stripePlanId,
          quantity: 1,
        },
      ],
      metadata: {
        companyId: existingUser.company.id,
        couponId: foundCoupon?.id ?? null,
        planId: foundPlan.id,
        stripeCouponId: foundCoupon?.stripeCouponId ?? null,
        stripePlanId: foundPlan.stripePlanId,
        stripeProductId: foundPlan.stripeProductId,
        userId: existingUser.id,
      },
      off_session: true,
      payment_behavior: "error_if_incomplete",
      trial_from_plan: companyAllSubscriptions === 0,
    });

    await database.subscription.create({
      data: {
        companyId: existingUser.company.id,
        couponId: foundCoupon?.id ?? undefined,
        planId: foundPlan.id,
        startDate: dayjs
          .unix(stripeCompanySubscription.current_period_start)
          .toDate(),
        status: E_SubscriptionStatusServer.PENDING,
        stripeSubscriptionId: stripeCompanySubscription.id,
      },
    });

    if (existingUser.company.freeTrial?.id) {
      await database.companyFreeTrial.delete({
        where: {
          companyId: existingUser.company.id,
          id: existingUser.company.freeTrial.id,
        },
      });
    }

    await sendSubscriptionCreated({
      request,
      toEmail: existingUser.email,
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateSubscription",
        modal: "createdSubscription",
        refetchUserSession: true,
      },
      redirectTo: E_Routes.companySubscriptions,
      request,
      status: 200,
    });
  } catch (error) {
    return responseCatchErrorWithStripeCard({ error, request });
  }
};

export const checkSubscriptionCoupon = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.couponPromotionCode]: zodValidator.couponPromotionCode,
        [formNames.planId]: zodValidator.planId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data || isFreeListingsServer()) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { couponPromotionCode, planId } = resultValidator.data;

    if (!couponPromotionCode) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.B2B_OWNER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.company?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const foundCoupon = await database.coupon.findUnique({
      select: prismaSelectCoupon,
      where: {
        NOT: {
          enabledAt: null,
        },
        plans: {
          some: {
            id: planId,
            NOT: {
              enabledAt: null,
            },
          },
        },
        promotionCode: couponPromotionCode.toUpperCase(),
      },
    });

    if (!foundCoupon) {
      return await responseOnFailure({
        message: "badPromotionCodeOrBadPlan",
        request,
        status: 422,
      });
    }

    const isDateExpired = hasDateExpired(foundCoupon.endDate.toString());
    if (isDateExpired) {
      return await responseOnFailure({
        message: "badPromotionCodeOrBadPlan",
        request,
        status: 422,
      });
    }

    if (foundCoupon?.plans?.length === 0) {
      return await responseOnFailure({
        message: "badPromotionCodeOrBadPlan",
        request,
        status: 422,
      });
    }

    const selectedPlan = foundCoupon?.plans?.at?.(0);

    if (!selectedPlan) {
      return await responseOnFailure({
        message: "badPromotionCodeOrBadPlan",
        request,
        status: 422,
      });
    }

    return await responseOnSuccess({
      data: {
        coupon: foundCoupon,
      },
      flashData: {
        message: "goodPromotionCode",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const cancelSubscription = async ({
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxSubscriptionDeleteImmediately]:
          zodValidator.checkbox,
        [formNames.subscriptionId]: zodValidator.subscriptionId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data || isFreeListingsServer()) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: true,
      prismaArguments: {
        select: { email: true, lang: true },
        where: {
          companyId: userCompanyId,
          id: userId,
          role: E_RolesServer.B2B_OWNER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.company?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const { checkboxSubscriptionDeleteImmediately, subscriptionId } =
      resultValidator.data;

    const foundSubscription = await database.subscription.findUnique({
      select: {
        status: true,
        stripeSubscriptionId: true,
      },
      where: {
        companyId: userCompanyId,
        id: subscriptionId,
        status: {
          notIn: checkboxSubscriptionDeleteImmediately
            ? [E_SubscriptionStatusServer.CANCELLED]
            : [
                E_SubscriptionStatusServer.CANCELLED,
                E_SubscriptionStatusServer.TO_BE_CANCELLED,
              ],
        },
      },
    });

    if (!foundSubscription?.stripeSubscriptionId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const validCheckboxSubscriptionDeleteImmediately =
      checkboxSubscriptionDeleteImmediately ||
      foundSubscription.status === E_SubscriptionStatusServer.PENDING ||
      foundSubscription.status === E_SubscriptionStatusServer.UNPAID;

    const resultStripe = await (validCheckboxSubscriptionDeleteImmediately
      ? stripe.subscriptions.cancel(foundSubscription.stripeSubscriptionId)
      : stripe.subscriptions.update(foundSubscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        }));

    await database.subscription.update({
      data: {
        endDate: resultStripe.cancel_at
          ? dayjs.unix(resultStripe.cancel_at).toDate()
          : dayjs.unix(resultStripe.current_period_end).toDate(),
        endDateExchangeFreeDays: validCheckboxSubscriptionDeleteImmediately
          ? null
          : undefined,
        nextPaymentAttempt: null,
        status: validCheckboxSubscriptionDeleteImmediately
          ? E_SubscriptionStatusServer.CANCELLED
          : E_SubscriptionStatusServer.TO_BE_CANCELLED,
      },
      where: {
        companyId: userCompanyId,
        id: subscriptionId,
        status: {
          notIn: validCheckboxSubscriptionDeleteImmediately
            ? [E_SubscriptionStatusServer.CANCELLED]
            : [
                E_SubscriptionStatusServer.CANCELLED,
                E_SubscriptionStatusServer.TO_BE_CANCELLED,
              ],
        },
      },
    });

    if (!validCheckboxSubscriptionDeleteImmediately) {
      await sendSubscriptionCancelled({
        request,
        toEmail: existingUser.email,
        userLanguage: existingUser.lang,
      });
    }

    const message = (() => {
      if (checkboxSubscriptionDeleteImmediately) {
        return "canceledSubscriptionImmediately";
      }

      if (
        foundSubscription.status === E_SubscriptionStatusServer.PENDING ||
        foundSubscription.status === E_SubscriptionStatusServer.UNPAID
      ) {
        return "canceledSubscriptionNoActive";
      }

      return "canceledSubscription";
    })();

    return await responseOnSuccess({
      flashData: {
        message,
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const checkCanUserCreateSubscription = async ({
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}): Promise<boolean> => {
  if (!userCompanyId || !userId || isFreeListingsServer()) {
    return false;
  }

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              subscriptions: {
                select: prismaSelectSubscription,
              },
            },
          },
        },
        where: {
          companyId: userCompanyId,
          id: userId,
          role: E_RolesServer.B2B_OWNER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError || !existingUser?.company?.subscriptions) {
      return false;
    }

    const foundActiveSubscription = getActiveSubscription({
      subscriptions: existingUser?.company?.subscriptions,
    });

    if (!foundActiveSubscription) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
