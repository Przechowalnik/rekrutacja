import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_CompanySettings = z.object({
  loginPasswordAt: zodDateValidator().nullable().optional(),
  twoFactorAuthenticationEnabledAt: zodDateValidator().nullable().optional(),
});

export type T_CompanySettings = z.infer<typeof Z_CompanySettings>;
