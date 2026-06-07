import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_CouponNested = z.object({
  amountOff: z.bigint().or(z.number()).nullable(),
  durationInMonths: z.number(),
  enabledAt: zodDateValidator().nullable(),
  endDate: zodDateValidator().nullable(),
  firstTimeTransaction: z.boolean(),
  id: z.string().uuid(),
  maxRedemptions: z.bigint().or(z.number()).nullable(),
  minimumAmount: z.bigint().or(z.number()).nullable(),
  name: z.string(),
  percentOff: z.number().nullable(),
  promotionCode: z.string(),
});

export type T_CouponNested = z.infer<typeof Z_CouponNested>;
