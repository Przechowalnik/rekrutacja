import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_UserAuthenticator2Fa = z.object({
  enabledAt: zodDateValidator().nullable(),
});

export type T_UserAuthenticator2Fa = z.infer<typeof Z_UserAuthenticator2Fa>;
