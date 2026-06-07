import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_PlanNested } from "../planNested";
import { Z_Subscription } from "../subscription";
import { Z_CompanyFreeTrial } from "./companyFreeTrial";
import { Z_CompanyPhone } from "./companyPhone";
import { Z_CompanySettings } from "./companySettings";
import { Z_CompanyStripe } from "./companyStripe";
import { Z_Points } from "./points";

export const Z_Company = z.object({
  activePlanInSubscriptionOrFreeTrial: Z_PlanNested.optional().nullable(),
  availableSlotToCreateNewListing: z.number().nullable().optional(),
  avatar: z.string().nullable(),
  bannerHero: z.string().nullable(),
  blockedAt: zodDateValidator().nullable().optional(),
  countWorkers: z.number().optional().nullable(),
  createdAt: zodDateValidator(),
  createdListingsInCurrentMonth: z.number().nullable().optional(),
  freeTrial: Z_CompanyFreeTrial.optional().nullable(),
  id: z.string().uuid(),
  isActiveFreeTrial: z.boolean().optional().nullable(),
  isActiveSubscription: z.boolean().optional().nullable(),
  isAvailableSlotsToCreateNewListing: z.boolean().nullable().optional(),
  name: z.string(),
  phone: Z_CompanyPhone.nullable().optional(),
  points: Z_Points.nullable().optional(),
  settings: Z_CompanySettings.nullable().optional(),
  slug: z.string().nullable().optional(),
  stripe: Z_CompanyStripe.nullable().optional(),
  subscriptions: Z_Subscription.array(),
});

export type T_Company = z.infer<typeof Z_Company>;
