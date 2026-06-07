import { z } from "zod";

import { Z_CouponNested } from "./couponNested";
import { Z_PlanNested } from "./planNested";

export const Z_Plan = Z_PlanNested.merge(
  z.object({
    coupons: Z_CouponNested.array(),
  }),
);

export type T_Plan = z.infer<typeof Z_Plan>;
