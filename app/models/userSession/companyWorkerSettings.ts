import { z } from "zod";

import { Z_CompanyWorkerPermissions } from "../enums";

export const Z_CompanyWorkerSettings = z.object({
  id: z.string().uuid(),
  permissions: Z_CompanyWorkerPermissions.array().nullable().optional(),
});

export type T_CompanyWorkerSettings = z.infer<typeof Z_CompanyWorkerSettings>;
