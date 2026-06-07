import dayjs from "dayjs";

import type { T_PlanNested } from "~/models/planNested";
import type { T_Subscription } from "~/models/subscription";
import type { T_Subscriptions } from "~/models/subscriptions";
import type { T_CompanyFreeTrial } from "~/models/userSession/companyFreeTrial";

import { E_SubscriptionStatusServer } from "./models.server";

export function isFreeTrialActive({
  freeTrial,
}: {
  freeTrial: T_CompanyFreeTrial;
}): boolean {
  const currentDate = dayjs();

  if (!freeTrial.plan) {
    return false;
  }

  if (!freeTrial.startDate) {
    return false;
  }

  if (freeTrial.endDate && dayjs(freeTrial.endDate).isBefore(currentDate)) {
    return false;
  }

  return true;
}

export const getActiveSubscription = ({
  subscriptions,
}: {
  subscriptions: T_Subscriptions;
}): null | T_Subscription => {
  const foundSubscription = subscriptions.find(
    item =>
      item.status !== E_SubscriptionStatusServer.CANCELLED &&
      item.status !== E_SubscriptionStatusServer.PENDING,
  );

  if (!foundSubscription) {
    return null;
  }

  return foundSubscription;
};

export const getCompanyActivePlan = ({
  freeTrial,
  subscriptions,
}: {
  freeTrial: null | T_CompanyFreeTrial | undefined;
  subscriptions: T_Subscriptions;
}): null | T_PlanNested => {
  if (freeTrial) {
    if (!freeTrial.plan) {
      console.warn("No detected plan in free trial");
      return null;
    }
    const checkIsActiveFreeTrial = isFreeTrialActive({ freeTrial });
    if (checkIsActiveFreeTrial) {
      return freeTrial.plan;
    }
  }

  const foundSubscription = getActiveSubscription({ subscriptions });

  if (!foundSubscription) {
    return null;
  }

  if (!foundSubscription?.plan) {
    console.warn("No detected plan in subscription");
    return null;
  }

  return foundSubscription.plan;
};
