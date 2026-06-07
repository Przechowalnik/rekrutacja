import { database } from "~/data/database.server";

import type { T_ResponseOnFailure } from "./response.server";

type T_PointsResult = {
  responseError?: T_ResponseOnFailure;
};

export const addPoints = async ({
  companyIdAddPoints,
  pointsToAdd,
  request,
  userIdAddPoints,
}: {
  companyIdAddPoints: null | string;
  pointsToAdd: number;
  request: Request;
  userIdAddPoints: null | string;
}): Promise<T_PointsResult | undefined> => {
  if (!companyIdAddPoints && !userIdAddPoints) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 401,
      },
    };
  }

  if (companyIdAddPoints && userIdAddPoints) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 401,
      },
    };
  }

  const isCompany = !!companyIdAddPoints;

  try {
    const updatedPoints = await database.points.update({
      data: {
        balance: {
          increment: pointsToAdd,
        },
      },
      select: {
        balance: true,
        id: true,
      },
      where: {
        ...(isCompany
          ? {
              companyId: companyIdAddPoints,
            }
          : {
              userId: userIdAddPoints as string,
            }),
      },
    });

    const balanceBeforeOperation = updatedPoints.balance - pointsToAdd;

    await database.pointsHistory.create({
      data: {
        amount: pointsToAdd,
        balanceAfterOperation: updatedPoints.balance,
        balanceBeforeOperation: Math.max(balanceBeforeOperation, 0),
        pointsId: updatedPoints.id,
      },
    });
  } catch {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 500,
      },
    };
  }
};

export const subtractPoints = async ({
  companyIdSubtractPoints,
  pointsToSubtract,
  request,
  userIdSubtractPoints,
}: {
  companyIdSubtractPoints: null | string;
  pointsToSubtract: number;
  request: Request;
  userIdSubtractPoints?: null | string;
}): Promise<T_PointsResult | undefined> => {
  if (!companyIdSubtractPoints && !userIdSubtractPoints) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 401,
      },
    };
  }

  if (companyIdSubtractPoints && userIdSubtractPoints) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 401,
      },
    };
  }

  const isCompany = !!companyIdSubtractPoints;

  try {
    const foundPoints = await database.points.findUnique({
      select: {
        balance: true,
      },
      where: {
        ...(isCompany
          ? {
              companyId: companyIdSubtractPoints,
            }
          : {
              userId: userIdSubtractPoints as string,
            }),
      },
    });

    if (!foundPoints?.balance) {
      return {
        responseError: {
          message: "noEnoughPoints",
          request,
          status: 422,
        },
      };
    }

    if (pointsToSubtract > foundPoints.balance) {
      return {
        responseError: {
          message: "noEnoughPoints",
          request,
          status: 422,
        },
      };
    }

    const updatedCompanyPoints = await database.points.update({
      data: {
        balance: {
          decrement: pointsToSubtract,
        },
      },
      select: {
        balance: true,
        id: true,
      },
      where: {
        ...(isCompany
          ? {
              companyId: companyIdSubtractPoints,
            }
          : {
              userId: userIdSubtractPoints as string,
            }),
      },
    });

    const balanceBeforeOperation =
      updatedCompanyPoints.balance + pointsToSubtract;

    await database.pointsHistory.create({
      data: {
        amount: -pointsToSubtract,
        balanceAfterOperation: updatedCompanyPoints.balance,
        balanceBeforeOperation: Math.max(balanceBeforeOperation, 0),
        pointsId: updatedCompanyPoints.id,
      },
    });
  } catch {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 500,
      },
    };
  }
};

type T_AddPointsFromReferral = {
  referralCode: string;
  request: Request;
};

export const addPointsFromReferral = async ({
  referralCode,
  request,
}: T_AddPointsFromReferral): Promise<T_PointsResult | undefined> => {
  try {
    const foundReferral = await database.referral.findUnique({
      select: {
        companyId: true,
        id: true,
        userId: true,
      },
      where: {
        code: referralCode,
      },
    });

    if (!foundReferral) {
      await database.user.updateMany({
        data: {
          createdFromReferralCode: null,
        },
        where: {
          createdFromReferralCode: referralCode,
        },
      });

      await database.company.updateMany({
        data: {
          createdFromReferralCode: null,
        },
        where: {
          createdFromReferralCode: referralCode,
        },
      });

      return undefined;
    }
    const foundPlatformSettings = await database.platformSetting.findFirst({
      select: {
        pointsReferralCompany: true,
        pointsReferralUser: true,
      },
    });

    if (!foundPlatformSettings) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    if (!foundReferral?.companyId && !foundReferral?.userId) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    if (foundReferral?.companyId && foundReferral?.userId) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    const resultAddPoints = await addPoints({
      companyIdAddPoints: foundReferral?.companyId ?? null,
      pointsToAdd: foundPlatformSettings.pointsReferralCompany,
      request,
      userIdAddPoints: foundReferral?.userId ?? null,
    });

    if (resultAddPoints?.responseError) {
      return {
        responseError: resultAddPoints?.responseError,
      };
    }

    await database.referral.update({
      data: {
        countCompanies: {
          increment: 1,
        },
      },
      where: {
        id: foundReferral.id,
      },
    });
  } catch {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 500,
      },
    };
  }
};
