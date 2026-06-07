import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_UserPhone = z.object({
  countryCode: z.number().nullable(),
  countryCodeToConfirm: z.number().nullable(),
  number: z.bigint().or(z.number()).nullable(),
  numberToConfirm: z.bigint().or(z.number()).nullable(),
  verifiedAt: zodDateValidator().nullable(),
});

export type T_UserPhone = z.infer<typeof Z_UserPhone>;
