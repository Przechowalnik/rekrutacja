import { z } from "zod";

import { Z_CouponNested } from "./couponNested";
import { Z_PlanNested } from "./planNested";

export const Z_Coupon = Z_CouponNested.merge(
  z.object({
    plans: Z_PlanNested.array(),
  }),
);

export type T_Coupon = z.infer<typeof Z_Coupon>;
