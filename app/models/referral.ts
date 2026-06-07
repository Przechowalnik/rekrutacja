import { z } from "zod";

export const Z_Referral = z.object({
  code: z.string(),
  countCompanies: z.number(),
  countUsers: z.number(),
});

export type T_Referral = z.infer<typeof Z_Referral>;
