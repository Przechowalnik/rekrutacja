import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_PlanInterval, Z_PlanType } from "./enums";

export const Z_PlanNested = z.object({
  description: z.string(),
  enabledAt: zodDateValidator().nullable(),
  id: z.string().uuid(),
  interval: Z_PlanInterval.nullable().optional(),
  intervalCount: z.number().nullable().optional(),
  listingDurationMonths: z.number(),
  maximumListingsInMonth: z.number(),
  name: z.string(),
  price: z.bigint().or(z.number()),
  type: Z_PlanType,
});

export type T_PlanNested = z.infer<typeof Z_PlanNested>;
