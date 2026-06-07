import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_UserAuthenticatorEmailOtp = z.object({
  enabledAt: zodDateValidator().nullable(),
});

export type T_UserAuthenticatorEmailOtp = z.infer<
  typeof Z_UserAuthenticatorEmailOtp
>;
