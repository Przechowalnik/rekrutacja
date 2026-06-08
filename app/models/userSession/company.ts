import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_CompanyPhone } from "./companyPhone";
import { Z_CompanySettings } from "./companySettings";

export const Z_Company = z.object({
  avatar: z.string().nullable(),
  bannerHero: z.string().nullable(),
  blockedAt: zodDateValidator().nullable().optional(),
  countWorkers: z.number().optional().nullable(),
  createdAt: zodDateValidator(),
  createdListingsInCurrentMonth: z.number().nullable().optional(),
  id: z.string().uuid(),
  name: z.string(),
  phone: Z_CompanyPhone.nullable().optional(),
  settings: Z_CompanySettings.nullable().optional(),
  slug: z.string().nullable().optional(),
});

export type T_Company = z.infer<typeof Z_Company>;
