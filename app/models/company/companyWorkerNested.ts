import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_Roles } from "../enums";

export const Z_CompanyWorkerNested = z.object({
  avatar: z.string().nullable(),
  blockedAt: zodDateValidator().nullable().optional(),
  email: z.string(),
  firstName: z.string(),
  id: z.string().uuid(),
  lastName: z.string().nullable().optional(),
  role: Z_Roles,
});

export type T_CompanyWorkerNested = z.infer<typeof Z_CompanyWorkerNested>;
