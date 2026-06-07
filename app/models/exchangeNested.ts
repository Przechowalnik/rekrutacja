import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_ExchangeNested = z.object({
  enabledAt: zodDateValidator().nullable(),
  id: z.string().uuid(),
  name: z.string(),
  points: z.number(),
  sms: z.number().nullable().optional(),
  subscriptionFreeDays: z.number().nullable().optional(),
});

export type T_ExchangeNested = z.infer<typeof Z_ExchangeNested>;
