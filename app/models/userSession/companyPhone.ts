import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_CompanyPhone = z.object({
  countryCode: z.number().nullable().optional(),
  countryCodeToConfirm: z.number().nullable().optional(),
  number: z.bigint().or(z.number()).nullable().optional(),
  numberToConfirm: z.bigint().or(z.number()).nullable().optional(),
  verifiedAt: zodDateValidator().nullable().optional(),
});

export type T_CompanyPhone = z.infer<typeof Z_CompanyPhone>;
