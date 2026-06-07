import { z } from "zod";

import { Z_PlanNested } from "./planNested";

export const Z_PlatformSetting = z.object({
  freeTrialCompanyMonthsCount: z.number(),
  freeTrialMaxListings: z.number(),
  planFreeTrialCompany: Z_PlanNested,
  pointsBigBug: z.number(),
  pointsMediumBug: z.number(),
  pointsReferralCompany: z.number(),
  pointsReferralUser: z.number(),
  pointsSmallBug: z.number(),
});

export type T_PlatformSetting = z.infer<typeof Z_PlatformSetting>;
