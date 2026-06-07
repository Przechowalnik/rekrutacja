import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_PlanNested } from "../planNested";

export const Z_CompanyFreeTrial = z.object({
  endDate: zodDateValidator(),
  id: z.string().uuid(),
  plan: Z_PlanNested,
  startDate: zodDateValidator(),
});

export type T_CompanyFreeTrial = z.infer<typeof Z_CompanyFreeTrial>;
