import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectCoupon, prismaSelectCoupons } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { CURRENCY, formatAmountForStripe, stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const deleteCouponAdmin = async ({
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
        [formNames.couponId]: zodValidator.couponId,
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
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const foundCoupon = await database.coupon.findUnique({
      select: {
        stripeCouponId: true,
      },
      where: {
        id: resultValidator.data[formNames.couponId],
      },
    });

    if (!foundCoupon) {
      return await responseOnFailure({
        message: "notFoundCoupon",
        request,
        status: 422,
      });
    }

    await stripe.coupons.del(foundCoupon.stripeCouponId);
    await database.coupon.delete({
      where: {
        id: resultValidator.data[formNames.couponId],
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successDeleteCoupon",
      },
      redirectTo: E_Routes.adminCoupons,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateCouponAdmin = async ({
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
        [formNames.checkboxCouponActive]: zodValidator.checkbox,
        [formNames.couponId]: zodValidator.couponId,
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
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const foundCoupon = await database.coupon.findUnique({
      select: {
        enabledAt: true,
        stripeCouponId: true,
        stripePromotionCodeId: true,
      },
      where: {
        id: resultValidator.data[formNames.couponId],
      },
    });

    if (!foundCoupon) {
      return await responseOnFailure({
        message: "notFoundCoupon",
        request,
        status: 422,
      });
    }

    const updatedPromotionCode = await stripe.promotionCodes.update(
      foundCoupon.stripePromotionCodeId,
      {
        active: !foundCoupon.enabledAt,
      },
    );

    await database.coupon.update({
      data: {
        enabledAt: updatedPromotionCode.active ? dayjs().toDate() : null,
      },
      where: {
        id: resultValidator.data[formNames.couponId],
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCoupon",
      },
      redirectTo: E_Routes.adminCoupons,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const createNewCouponAdmin = async ({
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
      arrayData: [formNames.plansId],
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxCouponActive]: zodValidator.checkbox,
        [formNames.couponAmountOff]: zodValidator.couponAmountOff.optional(),
        [formNames.couponDurationInMonths]: zodValidator.couponDurationInMonths,
        [formNames.couponEndDate]: zodValidator.date,
        [formNames.couponFirstTimeTransaction]: zodValidator.checkbox,
        [formNames.couponMaxRedemptions]:
          zodValidator.couponMaxRedemptions.optional(),
        [formNames.couponMinimumAmount]:
          zodValidator.couponMinimumAmount.optional(),
        [formNames.couponName]: zodValidator.couponName,
        [formNames.couponPercentOff]: zodValidator.couponPercentOff.optional(),
        [formNames.couponPromotionCode]: zodValidator.couponPromotionCode,
        [formNames.plansId]: zodValidator.planId.array(),
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
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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
      checkboxCouponActive,
      couponAmountOff,
      couponDurationInMonths,
      couponEndDate,
      couponFirstTimeTransaction,
      couponMaxRedemptions,
      couponMinimumAmount,
      couponName,
      couponPercentOff,
      couponPromotionCode,
      plansId,
    } = resultValidator.data;

    if (!couponAmountOff && !couponPercentOff) {
      return await responseOnFailure({
        message: "noAddedPercentOrAmountToCoupon",
        request,
        status: 422,
      });
    }

    if (
      typeof couponAmountOff === "number" &&
      typeof couponMinimumAmount === "number" &&
      couponAmountOff > couponMinimumAmount
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (plansId?.length === 0) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const countCoupon = await database.coupon.count({
      where: {
        promotionCode: couponPromotionCode.toUpperCase(),
      },
    });

    if (countCoupon > 0) {
      return await responseOnFailure({
        message: "couponCodeExists",
        request,
        status: 422,
      });
    }

    const foundPlans = await database.plan.findMany({
      select: {
        id: true,
        price: true,
      },
      where: {
        id: {
          in: plansId,
        },
        isDeletedAt: null,
      },
    });

    if (plansId?.length !== foundPlans?.length) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (
      typeof couponAmountOff === "number" &&
      typeof couponMinimumAmount === "number"
    ) {
      for (const plan of foundPlans) {
        if (plan.price < formatAmountForStripe(couponMinimumAmount)) {
          return await responseOnFailure({
            message: "badDiscountsInCoupon",
            request,
            status: 422,
          });
        }
        if (Number(plan.price) < formatAmountForStripe(couponAmountOff)) {
          return await responseOnFailure({
            message: "badDiscountsInCoupon",
            request,
            status: 422,
          });
        }
      }
    }

    const stripeCoupon = await stripe.coupons.create({
      amount_off:
        typeof couponAmountOff === "number"
          ? formatAmountForStripe(couponAmountOff)
          : undefined,
      currency: CURRENCY,
      duration: "repeating",
      duration_in_months: couponDurationInMonths,
      max_redemptions: couponMaxRedemptions,
      metadata: {
        userId,
      },
      name: couponName,
      percent_off: couponPercentOff,
      redeem_by: dayjs(couponEndDate).unix(),
    });

    const stripePromotionCode = await stripe.promotionCodes.create({
      active: checkboxCouponActive ?? false,
      code: couponPromotionCode.toUpperCase(),
      coupon: stripeCoupon.id,
      customer: undefined,
      restrictions: {
        first_time_transaction: couponFirstTimeTransaction,
        minimum_amount:
          typeof couponMinimumAmount === "number"
            ? formatAmountForStripe(couponMinimumAmount)
            : undefined,
        minimum_amount_currency:
          typeof couponMinimumAmount === "number" ? CURRENCY : undefined,
      },
    });

    await database.coupon.create({
      data: {
        amountOff: couponAmountOff
          ? formatAmountForStripe(couponAmountOff)
          : undefined,
        durationInMonths: couponDurationInMonths,
        enabledAt: checkboxCouponActive ? dayjs().toDate() : null,
        endDate: couponEndDate,
        firstTimeTransaction: couponFirstTimeTransaction ?? false,
        maxRedemptions: couponMaxRedemptions,
        minimumAmount:
          typeof couponMinimumAmount === "number"
            ? formatAmountForStripe(couponMinimumAmount)
            : undefined,
        name: couponName,
        percentOff: couponPercentOff,
        plans: {
          connect: plansId.map(planId => ({ id: planId })),
        },
        promotionCode: couponPromotionCode.toUpperCase(),
        stripeCouponId: stripeCoupon.id,
        stripePromotionCodeId: stripePromotionCode.id,
      },
      select: {
        id: true,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateCoupon",
      },
      redirectTo: E_Routes.adminCoupons,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getCouponAdmin = async ({
  couponId,
  request,
  userId,
  userSessionVersion,
}: {
  couponId?: string;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!couponId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    if (!existingUser) {
      return redirectOnError;
    }

    const foundCoupon = await database.coupon.findUnique({
      select: prismaSelectCoupon,
      where: {
        id: couponId,
      },
    });

    if (!foundCoupon) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        coupon: foundCoupon,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getCouponsAdmin = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    if (!existingUser) {
      return redirectOnError;
    }

    const foundCoupons = await database.coupon.findMany({
      orderBy: {
        endDate: "asc",
      },
      select: prismaSelectCoupons,
    });

    return await responseOnSuccess({
      data: {
        coupons: foundCoupons,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};
