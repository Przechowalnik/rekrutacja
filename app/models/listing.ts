import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_ListingPaymentStatus } from "./enums";
import { Z_ListingNested } from "./listingNested";

const Z_ListingPayment = z.object({
  createdAt: zodDateValidator().nullable().optional(),
  free: z.boolean(),
  status: Z_ListingPaymentStatus,
  stripeCheckoutId: z.string().optional().nullable(),
  stripeCheckoutUrl: z.string().optional().nullable(),
  updatedAt: zodDateValidator().nullable().optional(),
});

const Z_ListingCount = z.object({
  contacts: z.number().nullable().optional(),
  views: z.number().nullable().optional(),
});

export const Z_Listing = Z_ListingNested.merge(
  z.object({
    _count: Z_ListingCount.nullable().optional(),
    payments: Z_ListingPayment.array().optional(), // limit 5
  }),
);

export type T_Listing = z.infer<typeof Z_Listing>;
