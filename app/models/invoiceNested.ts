import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_SubscriptionNested } from "./subscriptionNested";

export const Z_InvoiceNested = z.object({
  createdAt: zodDateValidator(),
  id: z.string().uuid(),
  subscription: Z_SubscriptionNested.nullable().optional(),
});

export type T_InvoiceNested = z.infer<typeof Z_InvoiceNested>;
