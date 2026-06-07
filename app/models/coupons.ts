import { z } from "zod";

import { Z_CouponNested } from "./couponNested";
import { Z_PlanNested } from "./planNested";

export const Z_Coupons = Z_CouponNested.merge(
  z.object({
    plans: Z_PlanNested.array(),
  }),
).array();

export type T_Coupons = z.infer<typeof Z_Coupons>;
