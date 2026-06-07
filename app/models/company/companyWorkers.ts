import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_CompanyWorkerPermissions } from "../enums";
import { Z_CompanyWorkerNested } from "./companyWorkerNested";

const Z_CompanyWorkersSettings = z.object({
  id: z.string().uuid(),
  permissions: Z_CompanyWorkerPermissions.array().nullable().optional(),
});

const Z_CompanyWorkersEmailVerification = z.object({
  verifiedAt: zodDateValidator().nullable().optional(),
});

export const Z_CompanyWorkers = Z_CompanyWorkerNested.merge(
  z.object({
    emailVerification: Z_CompanyWorkersEmailVerification.nullable().optional(),
    workerSettings: Z_CompanyWorkersSettings.nullable().optional(),
  }),
).array();

export type T_CompanyWorkers = z.infer<typeof Z_CompanyWorkers>;
