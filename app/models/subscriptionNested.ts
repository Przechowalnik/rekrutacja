import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_CouponNested } from "./couponNested";
import { Z_SubscriptionStatus } from "./enums";
import { Z_PlanNested } from "./planNested";

export const Z_SubscriptionNested = z.object({
  coupon: Z_CouponNested.optional().nullable(),
  endDate: zodDateValidator().nullable(),
  endDateExchangeFreeDays: zodDateValidator().nullable().optional(),
  extraFreeDaysInCurrentPeriod: z.number().nullable().optional(),
  id: z.string().uuid(),
  nextPaymentAttempt: zodDateValidator().nullable().optional(),
  plan: Z_PlanNested,
  startDate: zodDateValidator(),
  status: Z_SubscriptionStatus,
});

export type T_SubscriptionNested = z.infer<typeof Z_SubscriptionNested>;
