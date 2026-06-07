import { database } from "~/data/database.server";

import { E_PlanTypeServer } from "./models.server";
import { prismaSelectPlan } from "./prismaSelect.server";
import { responseGetOnFailure, responseOnSuccess } from "./response.server";

type T_GetPlans = {
  extraProps?: object;
  request: Request;
  withTrial?: boolean;
};

export const getPlans = async ({
  extraProps = {},
  request,
  withTrial,
}: T_GetPlans) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const foundPlans = await database.plan.findMany({
      orderBy: {
        price: "asc",
      },
      select: {
        ...prismaSelectPlan,
      },
      where: {
        isDeletedAt: null,
        NOT: {
          enabledAt: null,
        },
        type: {
          notIn: withTrial ? [] : [E_PlanTypeServer.TRIAL],
        },
      },
    });

    return await responseOnSuccess({
      data: {
        plans: foundPlans,
        ...extraProps,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};
