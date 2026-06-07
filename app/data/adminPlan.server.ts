import dayjs from "dayjs";
import type Stripe from "stripe";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { E_PlanTypeServer, E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectPlan, prismaSelectPlans } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { CURRENCY, formatAmountForStripe, stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

async function updateAllSubscriptionsToNewPrice({
  newPriceId,
  oldPriceId,
  request,
}: {
  newPriceId: string;
  oldPriceId: string;
  request: Request;
}) {
  let hasMore = true;
  let startingAfter: string | undefined;
  let updatedSubscriptions: number = 0;

  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      price: oldPriceId,
      starting_after: startingAfter,
    });

    for (const subscription of subscriptions.data) {
      try {
        const firstProductFromSubscription = subscription.items.data.at(0);
        if (firstProductFromSubscription) {
          await stripe.subscriptions.update(subscription.id, {
            items: [
              {
                id: firstProductFromSubscription.id,
                price: newPriceId,
              },
            ],
            proration_behavior: "none",
          });

          updatedSubscriptions++;
        }
      } catch (error) {
        return await responseOnFailureServer({ error, request });
      }
    }

    hasMore = subscriptions.has_more;
    startingAfter = subscriptions.data.at(-1)?.id;
    console.warn(`Updated ${updatedSubscriptions} subscriptions.`);
  }
}

async function cancelAllSubscriptionsWithPlanId({
  request,
  stripePlanId,
}: {
  request: Request;
  stripePlanId: string;
}) {
  let hasMore = true;
  let startingAfter: string | undefined;
  let canceledSubscriptions: number = 0;

  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      plan: stripePlanId,
      starting_after: startingAfter,
    });

    for (const subscription of subscriptions.data) {
      try {
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true, // Set to `false` for immediate cancellation
        });

        canceledSubscriptions++;
      } catch (error) {
        console.error(
          `Error canceling subscription ${subscription.id}:`,
          error,
        );
        return await responseOnFailureServer({ error, request });
      }
    }

    hasMore = subscriptions.has_more;
    startingAfter = subscriptions.data.at(-1)?.id;
    console.warn(`Canceled ${canceledSubscriptions} subscriptions so far.`);
  }

  console.warn(
    `All subscriptions with planId ${stripePlanId} have been canceled.`,
  );
}

export const getPlansAdmin = async ({
  request,
  userId,
  userSessionVersion,
  withoutTrial = false,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
  withoutTrial?: boolean;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const { responseError } = await getAndCheckUser({
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    const foundPlans = await database.plan.findMany({
      orderBy: {
        price: "asc",
      },
      select: prismaSelectPlans,
      where: {
        isDeletedAt: null,
        type: {
          notIn: withoutTrial ? [E_PlanTypeServer.TRIAL] : [],
        },
      },
    });

    return await responseOnSuccess({
      data: {
        plans: foundPlans,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getPlanAdmin = async ({
  planId,
  request,
  userId,
  userSessionVersion,
}: {
  planId?: string;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!planId) {
      return redirectOnError;
    }

    const { responseError } = await getAndCheckUser({
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    const foundPlan = await database.plan.findUnique({
      select: prismaSelectPlan,
      where: {
        id: planId,
        isDeletedAt: null,
      },
    });

    if (!foundPlan) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        plan: foundPlan,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const deletePlanAdmin = async ({
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
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.planId]: zodValidator.planId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
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

    const { planId } = resultValidator.data;

    const foundPlan = await database.plan.findUnique({
      select: {
        stripePlanId: true,
        stripeProductId: true,
        type: true,
      },
      where: {
        id: planId,
        isDeletedAt: null,
      },
    });

    if (!foundPlan) {
      return await responseOnFailure({
        message: "notFoundPlan",
        request,
        status: 422,
      });
    }

    const isTrialPlanType = foundPlan.type === E_PlanTypeServer.TRIAL;

    const foundPlatformSettingsWithPlan =
      await database.platformSetting.findFirst({
        where: {
          planIdFreeTrialCompany: planId,
        },
      });

    if (foundPlatformSettingsWithPlan) {
      return await responseOnFailure({
        message: "foundPlatformSettingsWithPlan",
        request,
        status: 422,
      });
    }

    if (!isTrialPlanType) {
      if (!foundPlan?.stripePlanId || !foundPlan?.stripeProductId) {
        return await responseOnFailure({
          message: "notFoundPlan",
          request,
          status: 422,
        });
      }

      await cancelAllSubscriptionsWithPlanId({
        request,
        stripePlanId: foundPlan.stripePlanId,
      });

      const stripePlanPrices = await stripe.prices.list({
        product: foundPlan.stripeProductId,
      });

      for (const stripePrice of stripePlanPrices.data) {
        await stripe.prices.update(stripePrice.id, { active: false });
      }

      await stripe.plans.update(foundPlan.stripePlanId, {
        active: false,
      });
    }

    await database.plan.update({
      data: {
        isDeletedAt: dayjs().toDate(),
      },
      where: {
        id: planId,
        isDeletedAt: null,
      },
    });

    const coupons = await database.coupon.findMany({
      select: {
        id: true,
      },
      where: {
        plans: {
          some: { id: planId },
        },
      },
    });

    for (const coupon of coupons) {
      await database.coupon.update({
        data: {
          plans: {
            disconnect: { id: planId },
          },
        },
        where: { id: coupon.id },
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successDeletePlan",
      },
      redirectTo: E_Routes.adminPlans,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updatePlanAdmin = async ({
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
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxPlanActive]: zodValidator.checkbox,
        [formNames.planId]: zodValidator.planId,
        [formNames.planListingDurationMonths]:
          zodValidator.planListingDurationMonths,
        [formNames.planMaximumListingsInMonth]:
          zodValidator.planMaximumListingsInMonth,
        [formNames.planPrice]: zodValidator.planPrice.optional(),
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
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
    const {
      checkboxPlanActive,
      planId,
      planListingDurationMonths,
      planMaximumListingsInMonth,
      planPrice,
    } = resultValidator.data;

    const foundPlan = await database.plan.findUnique({
      select: {
        enabledAt: true,
        interval: true,
        intervalCount: true,
        price: true,
        stripePlanId: true,
        type: true,
      },
      where: {
        id: planId,
        isDeletedAt: null,
      },
    });

    if (!foundPlan) {
      return await responseOnFailure({
        message: "notFoundPlan",
        request,
        status: 422,
      });
    }

    const isTrialPlanType = foundPlan.type === E_PlanTypeServer.TRIAL;

    if (isTrialPlanType) {
      if (foundPlan.price || planPrice) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      await database.plan.update({
        data: {
          listingDurationMonths: planListingDurationMonths,
          maximumListingsInMonth: planMaximumListingsInMonth,
        },
        where: {
          id: planId,
          isDeletedAt: null,
        },
      });
    } else {
      if (!foundPlan.price || !planPrice) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const foundPlanWithSameParameters = await database.plan.count({
        where: {
          isDeletedAt: null,
          NOT: {
            id: planId,
          },
          price: formatAmountForStripe(planPrice),
        },
      });

      if (foundPlanWithSameParameters > 0) {
        return await responseOnFailure({
          message: "planExist",
          request,
          status: 422,
        });
      }

      const newPrice = formatAmountForStripe(planPrice);

      if (
        !foundPlan?.stripePlanId ||
        !foundPlan?.interval ||
        !foundPlan.intervalCount
      ) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const updatedPlan = await stripe.plans.update(foundPlan.stripePlanId, {
        active: checkboxPlanActive,
      });

      if (Number(foundPlan.price) === newPrice) {
        await database.plan.update({
          data: {
            enabledAt: updatedPlan.active ? dayjs().toDate() : null,
            listingDurationMonths: planListingDurationMonths,
            maximumListingsInMonth: planMaximumListingsInMonth,
          },
          where: {
            id: planId,
            isDeletedAt: null,
          },
        });
      } else {
        const planFromStripe = await stripe.plans.retrieve(
          foundPlan.stripePlanId,
        );

        if (!planFromStripe?.product) {
          return await responseOnFailure({
            message: "somethingWentWrong",
            request,
            status: 422,
          });
        }

        const productId =
          typeof planFromStripe.product === "string"
            ? planFromStripe.product
            : planFromStripe.product?.id;

        const pricesInStripeForPlan = await stripe.prices.list({
          active: true,
          limit: 1,
          product: productId,
        });

        if (
          pricesInStripeForPlan.data.length === 0 ||
          pricesInStripeForPlan.data.length > 1
        ) {
          return await responseOnFailure({
            message: "somethingWentWrong",
            request,
            status: 422,
          });
        }

        const selectCurrentPriceInStripeForPlan =
          pricesInStripeForPlan.data.at(0);

        if (!selectCurrentPriceInStripeForPlan) {
          return await responseOnFailure({
            message: "somethingWentWrong",
            request,
            status: 422,
          });
        }

        // create new price
        const newStripePrice = await stripe.prices.create({
          active: true,
          currency: CURRENCY,
          metadata: {
            userId,
          },
          product: productId,
          recurring: {
            interval:
              foundPlan.interval.toLowerCase() as Stripe.PlanCreateParams.Interval,
            interval_count: foundPlan.intervalCount,
          },
          unit_amount: newPrice,
        });

        // disable old price
        await stripe.prices.update(selectCurrentPriceInStripeForPlan.id, {
          active: false,
        });

        await database.plan.update({
          data: {
            enabledAt: updatedPlan.active ? dayjs().toDate() : null,
            listingDurationMonths: planListingDurationMonths,
            maximumListingsInMonth: planMaximumListingsInMonth,
            price: newPrice,
          },
          where: {
            id: resultValidator.data[formNames.planId],
            isDeletedAt: null,
          },
        });

        await updateAllSubscriptionsToNewPrice({
          newPriceId: newStripePrice.id,
          oldPriceId: selectCurrentPriceInStripeForPlan.id,
          request,
        });
      }
    }

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatePlan",
      },
      redirectTo: E_Routes.admin,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const createNewPlanAdmin = async ({
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
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxPlanActive]: zodValidator.checkbox.optional(),
        [formNames.planDescription]: zodValidator.planDescription,
        [formNames.planInterval]: zodValidator.planInterval.optional(),
        [formNames.planIntervalCount]:
          zodValidator.planIntervalCount.optional(),
        [formNames.planListingDurationMonths]:
          zodValidator.planListingDurationMonths,
        [formNames.planMaximumListingsInMonth]:
          zodValidator.planMaximumListingsInMonth,
        [formNames.planName]: zodValidator.planName,
        [formNames.planPrice]: zodValidator.planPrice.optional(),
        [formNames.planType]: zodValidator.planType,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
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

    const {
      checkboxPlanActive,
      planDescription,
      planInterval,
      planIntervalCount,
      planListingDurationMonths,
      planMaximumListingsInMonth,
      planName,
      planPrice,
      planType,
    } = resultValidator.data;

    const isTrialPlanType = planType === E_PlanTypeServer.TRIAL;

    if (isTrialPlanType) {
      await database.plan.create({
        data: {
          description: planDescription,
          enabledAt: dayjs().toDate(),
          intervalCount: planIntervalCount,
          isDeletedAt: null,
          listingDurationMonths: planListingDurationMonths,
          maximumListingsInMonth: planMaximumListingsInMonth,
          name: planName,
          price: 0,
          type: planType,
        },
      });
    } else {
      if (!planPrice || !planInterval) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const foundPlan = await database.plan.count({
        where: {
          isDeletedAt: null,
          OR: [
            {
              type: {
                in: [planType],
                not: E_PlanTypeServer.TRIAL,
              },
            },
            {
              price: formatAmountForStripe(planPrice),
            },
          ],
        },
      });

      if (foundPlan > 0) {
        return await responseOnFailure({
          message: "planExist",
          request,
          status: 422,
        });
      }

      const newStripePlan = await stripe.plans.create({
        active: checkboxPlanActive,
        amount: formatAmountForStripe(planPrice),
        currency: CURRENCY,
        interval:
          planInterval.toLowerCase() as Stripe.PlanCreateParams.Interval,
        interval_count: planIntervalCount,
        metadata: {
          userId,
        },
        nickname: planDescription,
        product: {
          active: checkboxPlanActive,
          metadata: {
            planType: planType,
            userId,
          },
          name: planName,
        },
        usage_type: "licensed",
      });

      await database.plan.create({
        data: {
          description: planDescription,
          enabledAt: checkboxPlanActive ? dayjs().toDate() : null,
          interval: planInterval,
          intervalCount: planIntervalCount,
          isDeletedAt: null,
          listingDurationMonths: planListingDurationMonths,
          maximumListingsInMonth: planMaximumListingsInMonth,
          name: planName,
          price: formatAmountForStripe(planPrice),
          stripePlanId: newStripePlan?.id ?? null,
          stripeProductId: (newStripePlan?.product as null | string) ?? null,
          type: planType,
        },
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successCreatePlan",
      },
      redirectTo: E_Routes.adminPlans,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
