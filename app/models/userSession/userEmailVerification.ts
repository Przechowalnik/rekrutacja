import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_UserEmailVerification = z.object({
  verifiedAt: zodDateValidator().nullable(),
});

export type T_UserEmailVerification = z.infer<typeof Z_UserEmailVerification>;
