import { z } from "zod";

import { Z_CompanyWorkerSettingsNested } from "./companyWorkerSettingsNested";

const Z_CompanyWorkerSettingsUser = z.object({
  avatar: z.string().nullable(),
  firstName: z.string(),
  id: z.string().uuid(),
  lastName: z.string().nullable().optional(),
});

export const Z_CompanyWorkerSettings = Z_CompanyWorkerSettingsNested.merge(
  z.object({
    user: Z_CompanyWorkerSettingsUser,
  }),
);

export type T_CompanyWorkerSettings = z.infer<typeof Z_CompanyWorkerSettings>;
