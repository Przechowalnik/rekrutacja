import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_CompanyStripe = z.object({
  accountId: z.string().nullable().optional(),
  accountOnboardingActiveAt: zodDateValidator().nullable().optional(),
  costumerCardLast4Numbers: z.string().nullable().optional(),
  customerActive: z.boolean().nullable().optional(),
  customerCardId: z.string().nullable().optional(),
  customerHasCard: z.boolean().nullable().optional(),
  customerId: z.string().nullable().optional(),
});

export type T_CompanyStripe = z.infer<typeof Z_CompanyStripe>;
