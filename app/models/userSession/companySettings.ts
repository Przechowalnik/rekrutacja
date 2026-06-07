import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_CompanySettings = z.object({
  loginFacebookAt: zodDateValidator().nullable().optional(),
  loginGoogleAt: zodDateValidator().nullable().optional(),
  loginPasswordAt: zodDateValidator().nullable().optional(),
  twoFactorAuthenticationEnabledAt: zodDateValidator().nullable().optional(),
});

export type T_CompanySettings = z.infer<typeof Z_CompanySettings>;
