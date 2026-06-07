import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_Login = z.object({
  authenticator2FAEnabled: zodDateValidator().nullable().optional(),
  authenticatorEmailOTPEnabled: zodDateValidator().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});
