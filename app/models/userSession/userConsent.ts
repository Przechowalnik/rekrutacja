import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

export const Z_UserConsent = z.object({
  newsletterAt: zodDateValidator().nullable(),
  opinionAt: zodDateValidator().nullable(),
});

export type T_UserConsent = z.infer<typeof Z_UserConsent>;
