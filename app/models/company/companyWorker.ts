import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import { Z_CompanyWorkerPermissions } from "../enums";
import { Z_CompanyWorkerNested } from "./companyWorkerNested";

const Z_CompanyWorkerSettings = z.object({
  permissions: Z_CompanyWorkerPermissions.array().nullable().optional(),
});

const Z_CompanyWorkerEmailVerification = z.object({
  verifiedAt: zodDateValidator().nullable().optional(),
});

export const Z_CompanyWorker = Z_CompanyWorkerNested.merge(
  z.object({
    emailVerification: Z_CompanyWorkerEmailVerification.nullable().optional(),
    workerSettings: Z_CompanyWorkerSettings.nullable().optional(),
  }),
);

export type T_CompanyWorker = z.infer<typeof Z_CompanyWorker>;
